/**
 * Seed in_out_attendances: reg_no 1..9090, every day Jan–Dec of DB_YEAR,
 * in_time 10:00–12:00, out_time 14:00–18:00, notification flags 0 or 1.
 *
 * Run from admissionService: node seedInOutAttendance.js
 * Requires DB_YEAR in .env and par_student rows (e.g. seedPersonalInformation.js).
 */
require('dotenv').config();

const { InOutAttendance, sequelize } = require('./models');

const REG_START = 1;
const REG_END = 9090;
const BATCH_SIZE = 1000;

const YEAR = Number(process.env.DB_YEAR);

function pad2(n) {
  return String(n).padStart(2, '0');
}

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** Random TIME between hour ranges (inclusive start hour, exclusive end hour + 1) */
function randomTimeBetween(startHour, endHour) {
  const startMins = startHour * 60;
  const endMins = endHour * 60;
  const total = endMins - startMins;
  const offset = Math.floor(Math.random() * total);
  const mins = startMins + offset;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${pad2(h)}:${pad2(m)}:00`;
}

function randomFlag() {
  return randomInt(0, 1) === 1;
}

function buildDatesForYear(year) {
  const dates = [];
  for (let month = 1; month <= 12; month += 1) {
    const daysInMonth = new Date(year, month, 0).getDate();
    for (let day = 1; day <= daysInMonth; day += 1) {
      dates.push(`${year}-${pad2(month)}-${pad2(day)}`);
    }
  }
  return dates;
}

function buildRow(reg_no, attendance_date) {
  const in_time = randomTimeBetween(10, 12);
  let out_time = randomTimeBetween(14, 18);
  if (out_time <= in_time) {
    out_time = randomTimeBetween(15, 18);
  }

  return {
    reg_no,
    attendance_date,
    in_time,
    in_time_notification_flag: randomFlag(),
    out_time,
    out_time_notification_flag: randomFlag(),
  };
}

async function seed() {
  if (!Number.isFinite(YEAR)) {
    throw new Error('DB_YEAR must be set in .env (e.g. DB_YEAR=2026)');
  }

  try {
    await sequelize.authenticate();
    console.log(`Connected. Seeding in/out attendance for year ${YEAR}.`);

    const dates = buildDatesForYear(YEAR);
    const studentsPerDay = REG_END - REG_START + 1;
    const expectedTotal = dates.length * studentsPerDay;

    console.log(
      `Dates: ${dates[0]} to ${dates[dates.length - 1]} (${dates.length} days)`
    );
    console.log(`Students per day: ${studentsPerDay}`);
    console.log(`Expected rows: ${expectedTotal}`);

    let inserted = 0;

    for (let d = 0; d < dates.length; d += 1) {
      const attendance_date = dates[d];
      let buffer = [];

      for (let reg_no = REG_START; reg_no <= REG_END; reg_no += 1) {
        buffer.push(buildRow(reg_no, attendance_date));

        if (buffer.length >= BATCH_SIZE) {
          await InOutAttendance.bulkCreate(buffer, {
            validate: false,
            ignoreDuplicates: true,
          });
          inserted += buffer.length;
          buffer = [];
        }
      }

      if (buffer.length > 0) {
        await InOutAttendance.bulkCreate(buffer, {
          validate: false,
          ignoreDuplicates: true,
        });
        inserted += buffer.length;
      }

      if ((d + 1) % 10 === 0 || d === dates.length - 1) {
        console.log(
          `Progress: ${d + 1}/${dates.length} days, ~${inserted} rows inserted`
        );
      }
    }

    console.log(`Done. Inserted approximately ${inserted} rows.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
