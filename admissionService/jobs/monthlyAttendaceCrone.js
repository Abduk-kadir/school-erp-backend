const cron = require('node-cron');
const { Op, QueryTypes } = require('sequelize');
const {
  sequelize,
  monthlyattendancelastindex,
  InOutAttendance,
  monthlyattendance,
  attendancecronerecord,
} = require('../models');

const BATCH_SIZE = 100;
const DAY_COLUMNS = Array.from({ length: 31 }, (_, i) => String(i + 1));

function hasTime(time) {
  return Boolean(time) && time !== '00:00:00';
}

function convertTimeAmPm(time) {
  if (!hasTime(time)) return '';
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const pad2 = (n) => String(n).padStart(2, '0');
  return `${pad2(hours % 12 || 12)}:${pad2(minutes)} ${ampm}`;
}

// A class/division has a working day on a date when the attendance cron marked it, or when at
// least one of its students is present (same rule as the summary report).
async function getWorkingDays(cronRecords, records) {
  const workingDays = new Map();
  const addWorkingDay = (classid, divisionid, attendance_date) => {
    workingDays.set(`${classid}-${divisionid}-${attendance_date}`, {
      classid,
      divisionid,
      attendance_date,
    });
  };

  for (const cronRecord of cronRecords) {
    addWorkingDay(cronRecord.classid, cronRecord.divisionid, cronRecord.attendance_date);
  }

  const presentRecords = records.filter((r) => hasTime(r.in_time));
  if (presentRecords.length) {
    const students = await sequelize.query(
      `SELECT reg_no, class, division FROM par_student_personal_informations
       WHERE reg_no IN (:regNos)`,
      {
        replacements: { regNos: [...new Set(presentRecords.map((r) => r.reg_no))] },
        type: QueryTypes.SELECT,
      }
    );
    const studentByRegNo = new Map(students.map((s) => [String(s.reg_no), s]));
    for (const record of presentRecords) {
      const student = studentByRegNo.get(String(record.reg_no));
      if (student) addWorkingDay(student.class, student.division, record.attendance_date);
    }
  }

  return [...workingDays.values()];
}

// Absent students have no in_out_attendances row, so on each working day of a class/division
// its students without a row on that date are marked absent.
async function getAbsentEntries(workingDays) {
  const entries = [];
  for (const workingDay of workingDays) {
    const students = await sequelize.query(
      `SELECT reg_no FROM par_student_personal_informations
       WHERE class = :classid AND division = :divisionid`,
      {
        replacements: { classid: workingDay.classid, divisionid: workingDay.divisionid },
        type: QueryTypes.SELECT,
      }
    );
    if (!students.length) continue;

    const attendedRows = await InOutAttendance.findAll({
      where: {
        reg_no: students.map((s) => s.reg_no),
        attendance_date: workingDay.attendance_date,
      },
      attributes: ['reg_no'],
      raw: true,
    });
    const attendedRegNos = new Set(attendedRows.map((r) => String(r.reg_no)));

    for (const student of students) {
      if (attendedRegNos.has(String(student.reg_no))) continue;
      entries.push({
        reg_no: student.reg_no,
        attendance_date: workingDay.attendance_date,
        in_time: null,
        out_time: null,
      });
    }
  }
  return entries;
}

function applyTotals(row) {
  let present = 0;
  let absent = 0;
  for (const day of DAY_COLUMNS) {
    const code = String(row[day] || '').charAt(0);
    if (code === 'P') present += 1;
    if (code === 'A') absent += 1;
  }
  row.total_present = present;
  row.total_absent = absent;
  row.total_workingdays = present + absent;
  row.present_percent = row.total_workingdays
    ? Math.round((present / row.total_workingdays) * 100)
    : 0;
}

// Returns true when something was processed, so the caller keeps going until caught up.
async function buildMonthlyAttendance() {
    console.log('Building Monthly attendance detail table')
  const lastRow = await monthlyattendancelastindex.findOne();
  const lastIndex = lastRow ? Number(lastRow.lastreadvalue) : 0;
  const lastCronIndex = lastRow ? Number(lastRow.lastcronrecordid) : 0;
  console.log('Last read index:', lastIndex, 'Last cron record index:', lastCronIndex);

  const records = await InOutAttendance.findAll({
    where: { id: { [Op.gt]: lastIndex } },
    order: [['id', 'ASC']],
    limit: BATCH_SIZE,
    raw: true,
  });
  const cronRecords = await attendancecronerecord.findAll({
    where: {
      id: { [Op.gt]: lastCronIndex },
      isrun: true,
      attendance_date: { [Op.ne]: null },
    },
    order: [['id', 'ASC']],
    limit: BATCH_SIZE,
    raw: true,
  });
  if (records.length === 0 && cronRecords.length === 0) return false;

  // Absent entries go first so a present row for the same day always wins.
  const workingDays = await getWorkingDays(cronRecords, records);
  const entries = [...(await getAbsentEntries(workingDays)), ...records];

  // Load existing monthly rows of these students, so new values are added to them.
  const existingRows = entries.length
    ? await monthlyattendance.findAll({
        where: { reg_no: [...new Set(entries.map((r) => r.reg_no))] },
        raw: true,
      })
    : [];
  const rowsByKey = {};
  for (const row of existingRows) {
    rowsByKey[`${row.reg_no}-${row.year}-${row.month_number}`] = row;
  }

  const touchedKeys = new Set();
  for (const record of entries) {
    const [year, month, day] = String(record.attendance_date).split('-').map(Number);
    const key = `${record.reg_no}-${year}-${month}`;

    if (!rowsByKey[key]) {
      rowsByKey[key] = {
        reg_no: record.reg_no,
        year,
        month_number: month,
      };
    }
    const row = rowsByKey[key];

    row[day] = hasTime(record.in_time)
      ? `P (${convertTimeAmPm(record.in_time)} - ${convertTimeAmPm(record.out_time)})`
      : 'A';
    touchedKeys.add(key);
  }

  const changedRows = [...touchedKeys].map((key) => {
    applyTotals(rowsByKey[key]);
    return rowsByKey[key];
  });

  const lastReadId = records.length ? records[records.length - 1].id : lastIndex;
  const lastCronReadId = cronRecords.length
    ? cronRecords[cronRecords.length - 1].id
    : lastCronIndex;

  // Same transaction, so a failure never saves totals without moving the last index (or vice versa).
  await sequelize.transaction(async (transaction) => {
    if (changedRows.length) {
      await monthlyattendance.bulkCreate(changedRows, {
        updateOnDuplicate: [
          ...DAY_COLUMNS,
          'total_present',
          'total_absent',
          'total_workingdays',
          'present_percent',
          'updatedAt',
        ],
        transaction,
      });
    }

    const indexValues = { lastreadvalue: lastReadId, lastcronrecordid: lastCronReadId };
    if (lastRow) {
      await lastRow.update(indexValues, { transaction });
    } else {
      await monthlyattendancelastindex.create(indexValues, { transaction });
    }
  });

  console.log(
    `Processed ${records.length} attendance records (last id: ${lastReadId}) and ` +
      `${cronRecords.length} cron records (last id: ${lastCronReadId})`
  );
  return true;
}

function startMonthlyAttendanceReminderJob() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      while (await buildMonthlyAttendance());
    } catch (error) {
      console.log('error in cron monthly detail table creation', error);
    }
  });
}

module.exports = startMonthlyAttendanceReminderJob;
