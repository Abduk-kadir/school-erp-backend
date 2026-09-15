const cron = require('node-cron');
const { QueryTypes } = require('sequelize');
const { sequelize,} = require('../models');

function startAttendanceReminderJob() {
  // Runs every 30 seconds
  cron.schedule('*/30 * * * * *', async () => {
    console.log(`[Reminder] Sending reminder at ${new Date().toLocaleTimeString()}`);

    try {
      const query = `
        SELECT bm.*, b.* 
        FROM batch_masters AS bm 
        JOIN batches AS b ON bm.batchid = b.id
      `;

      const allbatches = await sequelize.query(query, {
        type: QueryTypes.SELECT,
      });

      console.log('allbatches ===>', allbatches);
      console.log('Total batches found:', allbatches.length);
      let studentbybatch=new Map()
      allbatches.map(async(batch)=>{
        let {classid,divsionid,batch_name}=batch;
        let student =sequelize.query(`Select reg_no, rfid, first_name, last_name from par_student_personal_informations where classid = :classid and divsionid = :divsionid`,{
          replacements:{classid,divsionid},
          type:QueryTypes.SELECT,
        })
        studentbybatch.set(`${classid}-${divsionid}`,student)
      })
      console.log('studentby batch by class and division',studentbybatch)

    } catch (err) {
      console.error('allbatches error:', err.message);
    }
  });

  console.log('✅ Attendance Reminder job started');
}

module.exports = startAttendanceReminderJob;