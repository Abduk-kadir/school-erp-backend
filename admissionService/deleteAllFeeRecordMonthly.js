/**
 * Deletes every row in FeeRecordMonthlies (FeeRecordMonthly model).
 * Destructive — use only on dev/test or when you intend to wipe fee records.
 *
 * Run from admissionService: node deleteAllFeeRecordMonthly.js
 */
const { FeeRecordMonthly, sequelize } = require('./models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const before = await FeeRecordMonthly.count();
    await FeeRecordMonthly.destroy({ truncate: true });
    console.log(`Removed all FeeRecordMonthly rows (count before: ${before}).`);
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('deleteAllFeeRecordMonthly failed:', error.message);
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
}

run();
