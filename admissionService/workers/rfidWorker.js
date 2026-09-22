const { Worker } = require('bullmq');
const { QueryTypes } = require('sequelize');
const redis = require('../config/redisConfig.js');
const {
  AllRfid,
  NotMatchedRfid,
  RfidUnknown,
  InOutAttendance,
  studentFcmtoken,
  sequelize,
  batchmaster,
  batch,
} = require('../models');
const { notificationQueue } = require('../queues/notificationQueue.js');

function pad2(n) {
  return String(n).padStart(2, '0');
}

function formatDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatTime(d) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function parsePunchDateTime(value) {
  if (!value) return new Date();
  const raw = String(value).trim();

  // YYYY-MM-DD HH:mm:ss or YYYY-MM-DDTHH:mm:ss
  let d = new Date(raw.replace(' ', 'T'));
  if (!Number.isNaN(d.getTime())) return d;

  // YYYYMMDDHHmmss
  const compact = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(raw);
  if (compact) {
    d = new Date(
      `${compact[1]}-${compact[2]}-${compact[3]}T${compact[4]}:${compact[5]}:${compact[6]}`
    );
    if (!Number.isNaN(d.getTime())) return d;
  }

  // DD/MM/YYYY HH:mm:ss
  const dmy = /^(\d{2})\/(\d{2})\/(\d{4})[ T](\d{2}):(\d{2}):(\d{2})$/.exec(raw);
  if (dmy) {
    d = new Date(`${dmy[3]}-${dmy[2]}-${dmy[1]}T${dmy[4]}:${dmy[5]}:${dmy[6]}`);
    if (!Number.isNaN(d.getTime())) return d;
  }

  return new Date();
}

function parseRfidRow(row) {
  const parts = String(row)
    .split(',')
    .map((item) => item.trim());
  const punchedAt =parsePunchDateTime(`${parts[2]} ${parts[3]}`);
 
  return {
    raw: row,
    machineId: parts[0] || null,
    rfid: parts[1] || null,
    punchedAt,
    attendanceDate: formatDate(punchedAt),
    punchTime: formatTime(punchedAt),
    flag: parts[4] || null,
  };
}
function timeToSeconds(t) {
  const [h, m, s] = String(t).split(':').map(Number);
  return h * 3600 + m * 60 + (s || 0);
}

async function upsertAttendanceAndCollectNotify(punch, student) {
  const { attendanceDate, punchTime, machineId, punchedAt } = punch;
  let row = await InOutAttendance.findOne({
    where: { reg_no: student.reg_no, attendance_date: attendanceDate },
  });

  const notifyJobs = [];
  const studentName = [student.first_name, student.last_name]
    .filter(Boolean)
    .join(' ')
    .trim() || `Reg ${student.reg_no}`;
console.log('student is***************************',student)
    const studentbatchendtime = await batchmaster.findOne({
      where: { classid: student.class, divisionid: student.division },
      include: [{ model: batch, as: 'batchInfo', attributes: ['endtime'] }],
      
    });
    
   const endtime = studentbatchendtime?.batchInfo?.endtime;
   console.log('endtime is***************************',endtime)
   let punchtimeInSeconds=timeToSeconds(punchTime)
   let endtimeInSeconds=timeToSeconds(endtime)
   let isOutPunch=punchtimeInSeconds>endtimeInSeconds
  if (!row&&!isOutPunch) {
    row = await InOutAttendance.create({
      reg_no: student.reg_no,
      attendance_date: attendanceDate,
      in_time: punchTime,
      in_time_notification_flag: true,
      out_time: null,
      out_time_notification_flag: false,
      machine_id: machineId,
    });
    notifyJobs.push({
      type: 'in',
      studentId: student.id,
      title: 'School Entry',
      body: `${studentName} entered school at ${punchTime}`,
      data: {
        type: 'attendance_in',
        reg_no: String(student.reg_no),
        attendance_date: attendanceDate,
        time: punchTime,
      },
      attendanceId: row.id,
      attendanceDate,
      flagField: 'in_time_notification_flag',
    });
    return { notifyJobs, punchedAt };
  }

  if (row&&!isOutPunch) {
    await row.update({
      in_time: punchTime,
      machine_id: machineId || row.machine_id,
      in_time_notification_flag:true,
    });
      notifyJobs.push({
        type: 'in',
        studentId: student.id,
        title: 'School Entry',
        body: `${studentName} entered school at ${punchTime}`,
        data: {
          type: 'attendance_in',
          reg_no: String(student.reg_no),
          attendance_date: attendanceDate,
          time: punchTime,
        },
        attendanceId: row.id,
        attendanceDate,
        flagField: 'in_time_notification_flag',
      });
    
    return { notifyJobs, punchedAt };
  }

  if(!row&&isOutPunch){
    row = await InOutAttendance.create({
      reg_no: student.reg_no,
      attendance_date: attendanceDate,
      in_time: punchTime,
      in_time_notification_flag: true,
      out_time: null,
      out_time_notification_flag: false,
      machine_id: machineId,
    });
    notifyJobs.push({
      type: 'in',
      studentId: student.id,
      title: 'School Entry',
      body: `${studentName} entered school at ${punchTime}`,
      data: {
        type: 'attendance_in',
        reg_no: String(student.reg_no),
        attendance_date: attendanceDate,
        time: punchTime,
      },
      attendanceId: row.id,
      attendanceDate,
      flagField: 'in_time_notification_flag',
    });

    return { notifyJobs, punchedAt };

  }
  if(row&&isOutPunch){
    await row.update({
      
      machine_id: machineId || row.machine_id,
      out_time:punchTime,
      out_time_notification_flag:true,
    });
      notifyJobs.push({
        type: 'out',
        studentId: student.id,
        title: 'School Exit',
        body: `${studentName} entered school at ${punchTime}`,
        data: {
          type: 'attendance_out',
          reg_no: String(student.reg_no),
          attendance_date: attendanceDate,
          time: punchTime,
        },
        attendanceId: row.id,
        attendanceDate,
        flagField: 'in_time_notification_flag',
      });
    
    return { notifyJobs, punchedAt };

  }
  
  return { notifyJobs, punchedAt };
}

async function queueNotifications(notifyJobs) {
  console.log("in queueNotifications section**********")
  if (!notifyJobs.length) return;

  const studentIds = [...new Set(notifyJobs.map((j) => j.studentId))];
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
  console.log('token by student :', tokensByStudent)
  await Promise.all(
    notifyJobs.map(async (job) => {
      const tokens = [...new Set(tokensByStudent.get(job.studentId) || [])];
      if (!tokens.length) return;

      await notificationQueue.add('send-push', {
        title: job.title,
        body: job.body,
        tokens,
        data: job.data,
      });

      await InOutAttendance.update(
        { [job.flagField]: true },
        {
          where: {
            id: job.attendanceId,
            attendance_date: job.attendanceDate,
          },
        }
      );
    })
  );
}

async function processRfidBatch(job) {
  const rows = Array.isArray(job.data?.rows) ? job.data.rows : [];
  if (!rows.length) return { processed: 0 };

  await AllRfid.bulkCreate(
    rows.map((data) => ({ data })),
    { validate: false }
  );

  const parsed = rows.map(parseRfidRow);
  console.log("parsed", parsed)
  const notMatched = parsed.filter((p) => p.flag !== '31');
  const valid = parsed.filter((p) => p.flag === '31' && p.rfid);

  if (notMatched.length) {
    await NotMatchedRfid.bulkCreate(
      notMatched.map((p) => ({ data: p.raw })),
      { validate: false }
    );
  }

  if (!valid.length) {
    return { processed: rows.length, matched: 0 };
  }

  const rfids = [...new Set(valid.map((v) => v.rfid))];
  console.log("rfids", rfids)
  const students = await sequelize.query(
    `SELECT id, reg_no, rfid, first_name, last_name,class,division
     FROM par_student_personal_informations
     WHERE rfid IN (:rfids)`,
    {
      replacements: { rfids },
      type: QueryTypes.SELECT,
    }
  );
  const studentByRfid = new Map(
    students.map((s) => [String(s.rfid), s])
  );

  const unknown = [];
  const punches = [];
  for (const punch of valid) {
    const student = studentByRfid.get(String(punch.rfid));
    if (!student) {
      unknown.push({ data: punch.raw });
    } else {
      punches.push({ punch, student });
    }
  }
  console.log("punches**********", punches)
  console.log("unknown**********", unknown)
  if (unknown.length) {
    await RfidUnknown.bulkCreate(unknown, { validate: false });
  }

  // Same student punches must stay ordered; different students can run parallel
  punches.sort((a, b) => a.punch.punchedAt - b.punch.punchedAt);
  const byStudent = new Map();
  for (const item of punches) {
    const key = String(item.student.reg_no);
    if (!byStudent.has(key)) byStudent.set(key, []);
    byStudent.get(key).push(item);
  }
  console.log("byStudent**********", byStudent)
  const allNotifyJobs = [];
  await Promise.all(
    [...byStudent.values()].map(async (studentPunches) => {
      for (const { punch, student } of studentPunches) {
        const { notifyJobs } = await upsertAttendanceAndCollectNotify(
          punch,
          student
        );
        allNotifyJobs.push(...notifyJobs);
      }
    })
  );

  console.log("allNotifyjobs********", allNotifyJobs)
  // Notifications are queued (not sent inline) so FCM stays async
  await queueNotifications(allNotifyJobs);

  return {
    processed: rows.length,
    matched: punches.length,
    unknown: unknown.length,
    notificationsQueued: allNotifyJobs.length,
  };
}

const worker = new Worker('rfid-attendance', processRfidBatch, {
  connection: redis,
  concurrency: 5,
});

module.exports = worker;
