/**
 * Deletes every row in FeeCollections (FeeCollection model).
 * Destructive — use only on dev/test or when you intend to wipe fee collections.
 *
 * FeeRecordMonthly rows reference FeeCollection via fee_table_id. If truncate fails
 * with a foreign-key error, run deleteAllFeeRecordMonthly.js first, then this script.
 *
 * Run from admissionService: node deleteAllFeeCollection.js
 */
const { FeeCollection, sequelize } = require('./models');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const before = await FeeCollection.count();
    await FeeCollection.destroy({ truncate: true });
    console.log(`Removed all FeeCollection rows (count before: ${before}).`);
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('deleteAllFeeCollection failed:', error.message);
    await sequelize.close().catch(() => {});
    process.exit(1);
  }
}

run();
