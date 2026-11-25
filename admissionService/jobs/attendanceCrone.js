const cron = require('node-cron');
const { QueryTypes } = require('sequelize');
const {
  sequelize,
  attendancecronerecord,
  InOutAttendance,
  studentFcmtoken,
} = require('../models');
const { notificationQueue } = require('../queues/notificationQueue');

function startAttendanceReminderJob() {
  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function formatTime(d) {
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  }

  function timeToSeconds(t) {
    const [h, m, s] = String(t).split(':').map(Number);
    return h * 3600 + m * 60 + (s || 0);
  }

  async function sendAbsentNotifications(absentStudents, attendanceDate) {
    if (!absentStudents.length) return;

    const studentIds = absentStudents.map((s) => s.id);
    const tokenRows = await studentFcmtoken.findAll({
      where: { studentid: studentIds },
      raw: true,
    });

    const tokensByStudent = new Map();
    for (const t of tokenRows) {
      if (!t.token || t.token.length <= 20) continue;
      if (!tokensByStudent.has(t.studentid)) tokensByStudent.set(t.studentid, []);
      tokensByStudent.get(t.studentid).push(t.token);
    }

    await Promise.all(
      absentStudents.map(async (student) => {
        const tokens = [...new Set(tokensByStudent.get(student.id) || [])];
        if (!tokens.length) return;

        const name =
          [student.first_name, student.last_name].filter(Boolean).join(' ') ||
          `Reg ${student.reg_no}`;

        await notificationQueue.add('send-push', {
          title: 'Absent Alert',
          body: `${name} is marked absent today`,
          tokens,
          data: {
            type: 'attendance_absent',
            reg_no: String(student.reg_no),
            attendance_date: attendanceDate,
          },
        });
      })
    );
  }

  cron.schedule('*/5 * * * *', async () => {
    console.log(`[Reminder] Sending reminder at ${new Date().toLocaleTimeString()}`);

    try {
      const allbatches = await sequelize.query(
        `SELECT bm.batchid, bm.classid, bm.divisionid, b.starttime, b.endtime, b.batch_name
         FROM batch_masters AS bm
         JOIN batches AS b ON bm.batchid = b.id`,
        { type: QueryTypes.SELECT }
      );

      const today = new Date().toISOString().split('T')[0];

      for (const batch of allbatches) {
        const { classid, divisionid, starttime, batchid } = batch;
        const diffSeconds =
          timeToSeconds(formatTime(new Date())) - timeToSeconds(starttime);

        if (diffSeconds <= 3600) continue;

        const attendanceCronRecord = await attendancecronerecord.findOne({
          where: { batchid, classid, divisionid,attendance_date:today },
        });
        if (attendanceCronRecord) continue;

        const students = await sequelize.query(
          `SELECT id, reg_no, rfid, first_name, last_name
           FROM par_student_personal_informations
           WHERE class = :classid AND division = :divisionid`,
          {
            replacements: { classid, divisionid },
            type: QueryTypes.SELECT,
          }
        );

        if (!students.length) continue;

        const attendedRows = await InOutAttendance.findAll({
          where: { reg_no: students.map((s) => s.reg_no), attendance_date: today },
          attributes: ['reg_no'],
          raw: true,
        });
        const attendedRegNos = new Set(attendedRows.map((r) => String(r.reg_no)));
        const absentStudents = students.filter((s) => !attendedRegNos.has(String(s.reg_no)));
        const presentCount = students.length - absentStudents.length;

        // Absent students get no in_out_attendances row; this record marks the day as a
        // working day for the class/division, which the reports use to count absents.
        if (presentCount >= 5) {
          console.log('school is open');

          await attendancecronerecord.create({
            batchid,
            classid,
            divisionid,
            attendance_date:today,
            isrun: true,
          });

          await sendAbsentNotifications(absentStudents, today);
        } else {
          console.log('school is closed');
        }
      }
    } catch (err) {
      console.error('attendance cron error:', err.message);
    }
  });

  console.log('✅ Attendance Reminder job started');
}

module.exports = startAttendanceReminderJob;
