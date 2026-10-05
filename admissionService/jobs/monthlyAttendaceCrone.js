const cron = require('node-cron');
const { Op } = require('sequelize');
const {
  sequelize,
  monthlyattendancelastindex,
  InOutAttendance,
  monthlyattendance,
} = require('../models');

const BATCH_SIZE = 100;
const DAY_COLUMNS = Array.from({ length: 31 }, (_, i) => String(i + 1));

function hasTime(time) {
  return Boolean(time) && time !== '00:00:00';
}

function convertTimeAmPm(time) {
  if (!hasTime(time)) return '';
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  return `${hours}:${minutes}:${seconds} ${ampm}`;
}

async function buildMonthlyAttendance() {
    console.log('Building Monthly attendance detail table')
  const lastRow = await monthlyattendancelastindex.findOne();
  const lastIndex = lastRow ? lastRow.lastreadvalue : 0;
  console.log('Last read index:', lastIndex);

  const records = await InOutAttendance.findAll({
    where: { id: { [Op.gt]: lastIndex } },
    order: [['id', 'ASC']],
    limit: BATCH_SIZE,
  });
  if (records.length === 0) return;

  // Load existing monthly rows of these students, so new values are added to them.
  const existingRows = await monthlyattendance.findAll({
    where: { reg_no: [...new Set(records.map((r) => r.reg_no))] },
    raw: true,
  });
  const rowsByKey = {};
  for (const row of existingRows) {
    rowsByKey[`${row.reg_no}-${row.year}-${row.month_number}`] = row;
  }

  for (const record of records) {
    const [year, month, day] = record.attendance_date.split('-').map(Number);
    const key = `${record.reg_no}-${year}-${month}`;

    if (!rowsByKey[key]) {
      rowsByKey[key] = {
        reg_no: record.reg_no,
        year,
        month_number: month,
        total_present: 0,
        total_absent: 0,
        total_workingdays: 0,
      };
    }
    const row = rowsByKey[key];

    const isPresent = hasTime(record.in_time);
    row[day] = isPresent
      ? `P ${convertTimeAmPm(record.in_time)}-${convertTimeAmPm(record.out_time)}`
      : 'A';
    row.total_present += isPresent ? 1 : 0;
    row.total_absent += isPresent ? 0 : 1;
    row.total_workingdays += 1;
    row.present_percent = Math.round((row.total_present / row.total_workingdays) * 100);
  }

  const lastReadId = records[records.length - 1].id;

  // Same transaction, so a failure never saves totals without moving the last index (or vice versa).
  await sequelize.transaction(async (transaction) => {
    await monthlyattendance.bulkCreate(Object.values(rowsByKey), {
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

    if (lastRow) {
      await lastRow.update({ lastreadvalue: lastReadId }, { transaction });
    } else {
      await monthlyattendancelastindex.create({ lastreadvalue: lastReadId }, { transaction });
    }
  });

  console.log(`Processed ${records.length} attendance records, last id: ${lastReadId}`);
}

function startMonthlyAttendanceReminderJob() {
  cron.schedule('*/30 * * * * *', async () => {
    try {
      await buildMonthlyAttendance();
    } catch (error) {
      console.log('error in cron monthly detail table creation', error);
    }
  });
}

module.exports = startMonthlyAttendanceReminderJob;
