/**
 * Seeds FeeCollections: fixed total per reg_no, cumulative payment rows.
 * No row is inserted when balance would be 0.
 *
 * Each row gets `date`: first of month starting April, day 1, year from DATE_ANCHOR_YEAR.
 * Same reg_no: 2026-04-01, 2026-05-01, 2026-06-01, ...
 * After a full cycle (balance hit 0), a new cycle would use dateForPayment(1, 0) → 2027-04-01, etc.
 *
 * Run from admissionService: node seedFeeCollection.js
 */
const { FeeCollection, sequelize } = require('./models');

const FEE_TOTAL = 12000;
const PAYMENT_AMOUNT = 1000;
/** Target row count; truncated down to full students if not divisible by rows per student */
const TOTAL_RECORDS = 100000;
const BATCH_SIZE = 2000;
const REG_NO_START = 1;

/** First cycle starts in April of this year. */
const DATE_ANCHOR_YEAR = 2026;
/** Calendar day of month for every seeded `date` (e.g. 1 → …-04-01, …-05-01). */
const DATE_FIXED_DAY = 1;

/**
 * @param {number} cycleIndex 0 = first fee period; after balance 0, next period increments this (dates restart at April)
 * @param {number} installmentIndex 0-based row within that period (April + installmentIndex months)
 */
function dateForPayment(cycleIndex, installmentIndex) {
  const startYear = DATE_ANCHOR_YEAR + cycleIndex;
  let monthIndex = 3 + installmentIndex;
  const year = startYear + Math.floor(monthIndex / 12);
  monthIndex %= 12;
  return new Date(Date.UTC(year, monthIndex, DATE_FIXED_DAY));
}

function buildRowTemplates(cycleIndex = 0) {
  const templates = [];
  let installmentIndex = 0;
  for (let total_paid = PAYMENT_AMOUNT; total_paid < FEE_TOTAL; total_paid += PAYMENT_AMOUNT) {
    templates.push({
      total: FEE_TOTAL,
      total_paid,
      payment: PAYMENT_AMOUNT,
      balance: FEE_TOTAL - total_paid,
      date: dateForPayment(cycleIndex, installmentIndex),
    });
    installmentIndex += 1;
  }
  return templates;
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const templates = buildRowTemplates();
    const perStudent = templates.length;
    const studentCount = Math.floor(TOTAL_RECORDS / perStudent);
    const actualRows = studentCount * perStudent;

    if (actualRows !== TOTAL_RECORDS) {
      console.log(
        `Note: TOTAL_RECORDS ${TOTAL_RECORDS} is not a multiple of ${perStudent} rows per student; inserting ${actualRows} rows (${studentCount} students).`
      );
    }

    console.log(
      `Inserting ${actualRows} rows (${studentCount} reg_no from ${REG_NO_START}, ${perStudent} payments each, no balance-0 row).`
    );

    let inserted = 0;
    let buffer = [];

    for (let s = 0; s < studentCount; s += 1) {
      const reg_no = REG_NO_START + s;
      for (const t of templates) {
        buffer.push({ reg_no, ...t });
        if (buffer.length >= BATCH_SIZE) {
          await FeeCollection.bulkCreate(buffer);
          inserted += buffer.length;
          buffer = [];
          console.log(`Inserted ${inserted} / ${actualRows}`);
        }
      }
    }

    if (buffer.length > 0) {
      await FeeCollection.bulkCreate(buffer);
      inserted += buffer.length;
      console.log(`Inserted ${inserted} / ${actualRows}`);
    }

    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
