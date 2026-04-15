/**
 * Removes every row from the par_student_personal_informations table.
 * Related tables (FeeCollections, FeeRecordMonthlies, etc.) are not modified.
 *
 * Run from admissionService:
 *   node scripts/delete-par-student-personal-information-all.js
 */
'use strict';

require('dotenv').config();
const path = require('path');
const models = require(path.join(__dirname, '..', 'models'));

async function main() {
  const { par_student_personal_information, sequelize } = models;

  await par_student_personal_information.destroy({
    where: {},
    truncate: true
  });

  console.log('All rows deleted from par_student_personal_informations.');
  await sequelize.close();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await models.sequelize.close();
  } catch (_) {
    /* ignore */
  }
  process.exit(1);
});
