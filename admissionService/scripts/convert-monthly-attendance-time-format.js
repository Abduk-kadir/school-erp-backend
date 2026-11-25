/**
 * One-time: rewrites old monthlyattendances day cells ("P 15:6:21 PM-17:10:0 PM", "P 15:6:21 PM-",
 * "P 15:6:21 PM") to the current format ("P (03:06 PM - 05:10 PM)", "P (03:06 PM - )").
 * Old cells hold 24-hour hours, so AM/PM is recalculated from the hour.
 *
 * Run from admissionService: node scripts/convert-monthly-attendance-time-format.js
 */
'use strict';

require('dotenv').config();
const { sequelize, monthlyattendance } = require('../models');

const DAY_COLUMNS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const OLD_CELL = /^P (\d{1,2}):(\d{1,2}):\d{1,2} [AP]M(?:-(?:(\d{1,2}):(\d{1,2}):\d{1,2} [AP]M)?)?$/;

function formatTime(hours, minutes) {
  const pad2 = (n) => String(n).padStart(2, '0');
  return `${pad2(hours % 12 || 12)}:${pad2(minutes)} ${hours >= 12 ? 'PM' : 'AM'}`;
}

function convertCell(value) {
  const match = OLD_CELL.exec(String(value || '').trim());
  if (!match) return null;
  const [, inH, inM, outH, outM] = match;
  const inTime = formatTime(Number(inH), Number(inM));
  const outTime = outH != null ? formatTime(Number(outH), Number(outM)) : '';
  return `P (${inTime} - ${outTime})`;
}

async function main() {
  const rows = await monthlyattendance.findAll({ raw: true });
  let changedRows = 0;
  let changedCells = 0;

  for (const row of rows) {
    const updates = {};
    for (const day of DAY_COLUMNS) {
      const converted = convertCell(row[day]);
      if (converted) updates[day] = converted;
    }
    if (!Object.keys(updates).length) continue;

    await monthlyattendance.update(updates, { where: { id: row.id } });
    changedRows += 1;
    changedCells += Object.keys(updates).length;
  }

  console.log(`Checked ${rows.length} rows, updated ${changedCells} cells in ${changedRows} rows`);
  await sequelize.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
