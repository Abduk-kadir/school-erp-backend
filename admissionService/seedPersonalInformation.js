/**
 * Dummy PersonalInformation rows: reg_no 1..9090, first_name A1..A9090,
 * class cycles 2,3,4,5,6,7,8,2,3,...
 *
 * Run from admissionService: node seedPersonalInformation.js
 */
const { PersonalInformation,par_student_personal_information, sequelize } = require('./models');

const REG_START = 1;
const REG_END = 9090;
const BATCH_SIZE = 500;

/** Class repeats 2..8 (7 values) per student index */
function classForIndex(i) {
  return String(2 + ((i - 1) % 7));
}

function buildRow(i) {
  return {
    reg_no: i,
    first_name: `A${i}`,
    last_name: `L${i}`,
    father_name: `F${i}`,
    class: classForIndex(i),
    division: 1,
    contact_number: `900000${String(i).padStart(4, '0')}`.slice(0, 15),
    email: `student${i}@dummy.local`,
    password: 'dummy',
    dob: '2010-01-01',
    blood_group: 'O+',
  };
}

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const total = REG_END - REG_START + 1;
    console.log(`Inserting ${total} PersonalInformation rows (${REG_START}..${REG_END}).`);

    let inserted = 0;
    let buffer = [];

    for (let i = REG_START; i <= REG_END; i += 1) {
      buffer.push(buildRow(i));
      if (buffer.length >= BATCH_SIZE) {
        await par_student_personal_information.bulkCreate(buffer);
        inserted += buffer.length;
        buffer = [];
        console.log(`Inserted ${inserted} / ${total}`);
      }
    }

    if (buffer.length > 0) {
      await PersonalInformation.bulkCreate(buffer);
      inserted += buffer.length;
      console.log(`Inserted ${inserted} / ${total}`);
    }

    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
}

seed();
