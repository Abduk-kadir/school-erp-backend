const { FeeRecordMonthly, sequelize } = require('./models');

const TOTAL_RECORDS = 2000000; // 20 lakh records
const BATCH_SIZE = 5000;

const feeHeads = ['Tuition Fee', 'Hostel Fee', 'Transport Fee', 'Library Fee', 'Lab Fee'];
const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRecord(index) {
  const regNo = 2601001 + index;
  const feeHead = feeHeads[index % feeHeads.length];
  const feeTableId = (index % feeHeads.length) + 1;
  const total = randomBetween(5, 20) * 10000;

  const record = {
    reg_no: regNo,
    fee_head: feeHead,
    fee_table_id: feeTableId,
    date: new Date(),
  };

  for (const month of months) {
    const paid = randomBetween(0, total / 10000) * 10000;
    record[`${month}_total`] = total;
    record[`${month}_paid`] = paid;
    record[`${month}_due`] = total - paid;
  }

  return record;
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');
    console.log(`Inserting ${TOTAL_RECORDS} records in batches of ${BATCH_SIZE}...`);

    for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
      const batch = [];
      const end = Math.min(i + BATCH_SIZE, TOTAL_RECORDS);

      for (let j = i; j < end; j++) {
        batch.push(generateRecord(j));
      }

      await FeeRecordMonthly.bulkCreate(batch);
      console.log(`Inserted ${end} / ${TOTAL_RECORDS} records`);
    }

    console.log('Done! All records inserted.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
