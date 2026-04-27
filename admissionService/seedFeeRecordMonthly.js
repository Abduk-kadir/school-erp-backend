const { FeeRecordMonthly, sequelize } = require('./models');

const LAST_REG_NO = 9090;
const J_MAX = 11;
const Z_MAX = 40;
const BATCH_SIZE = 2000;

const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_TOTAL = 25;
const MONTH_PAID = 25;
const MONTH_DUE = 0;

/**
 * Loops: for (i=1..9090) for (j=1..11) for (z=1..40)
 * - reg_no = i
 * - fee_head = z (1..40 per j)
 * - fee_table_id: see TABLE_ID_SOURCE below.
 *
 * TABLE_ID_SOURCE 'j' (default): fee_table_id = (i - 1) * J_MAX + j so ids continue across students:
 *   reg 1 → j=1..11 → table_id 1..11; reg 2 → j=1..11 → table_id 12..22; etc. (not restarting at 1 per reg_no).
 * TABLE_ID_SOURCE 'i': fee_table_id = i (same for all j,z for that student).
 */
const TABLE_ID_SOURCE = 'j'; // 'j' | 'i'

function feeTableId(i, j) {
  if (TABLE_ID_SOURCE === 'i') return i;
  return (i - 1) * J_MAX + j;
}

function buildRecord(i, j, z) {
  const record = {
    reg_no: i,
    feeheadid: z,
    fee_table_id: feeTableId(i, j),
    date: new Date(),
  };

  for (const m of months) {
    record[`${m}_total`] = MONTH_TOTAL;
    record[`${m}_paid`] = MONTH_PAID;
    record[`${m}_total_paid`] = MONTH_PAID;
    record[`${m}_total_due`] = MONTH_DUE;
  }

  return record;
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const totalRows = LAST_REG_NO * J_MAX * Z_MAX;
    const maxTableId = TABLE_ID_SOURCE === 'j' ? LAST_REG_NO * J_MAX : LAST_REG_NO;
    console.log(
      `Inserting ${totalRows} rows: reg_no=i, fee_table_id=${TABLE_ID_SOURCE === 'j' ? `(i-1)*${J_MAX}+j (1..${maxTableId})` : 'i'}, fee_head=z; months: total/paid ${MONTH_TOTAL}, due ${MONTH_DUE}.`
    );

    let inserted = 0;
    let buffer = [];

    for (let i = 1; i <= LAST_REG_NO; i += 1) {
      for (let j = 1; j <= J_MAX; j += 1) {
        for (let z = 1; z <= Z_MAX; z += 1) {
          buffer.push(buildRecord(i, j, z));
          if (buffer.length >= BATCH_SIZE) {
            await FeeRecordMonthly.bulkCreate(buffer);
            inserted += buffer.length;
            buffer = [];
            console.log(`Inserted ${inserted} / ${totalRows}`);
          }
        }
      }
    }

    if (buffer.length > 0) {
      await FeeRecordMonthly.bulkCreate(buffer);
      inserted += buffer.length;
      console.log(`Inserted ${inserted} / ${totalRows}`);
    }

    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
