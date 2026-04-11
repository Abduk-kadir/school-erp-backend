/**
 * Deletes every row in PersonalInformations (PersonalInformation model).
 * Destructive — use only on dev/test or when you intend to wipe students.
 *
 * If MySQL reports a foreign-key error, clear dependent tables first or run
 * deleteAllFeeRecordMonthly.js before this script if fee rows reference reg_no.
 *
 * Run from admissionService: node deleteAllPersonalInformation.js
 */
const { PersonalInformation, sequelize } = require('./models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const before = await PersonalInformation.count();
    await PersonalInformation.destroy({ truncate: true });
    console.log(`Removed all PersonalInformation rows (count before: ${before}).`);
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('deleteAllPersonalInformation failed:', error.message);
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
}

run();
