const { form_status } = require('../models');
const db = require('../models')
const sequelize = db.sequelize;


const formStatusController = {
  // Create or update form status for a student
  // Usually called when student moves to next step
  async upsert(req, res) {
    try {
      const { reg_no, current_step } = req.body;
      console.log('reg no:', reg_no)
      console.log('current step', current_step)

      if (!reg_no || current_step === undefined) {
        return res.status(400).json({
          message: 'reg_no and current_step are required',
        });
      }

      // upsert = update if exists, create if not
      const [formStatus, created] = await form_status.findOrCreate({
        where: { reg_no },
        defaults: {
          reg_no,
          current_step,
        },
      });
      console.log('************', formStatus, created)
      if (!created) {
        // already existed → update step
        await formStatus.update({ current_step });
      }

      return res.status(created ? 201 : 200).json({
        message: created ? 'Form status created' : 'Form status updated',
        data: formStatus,
      });
    } catch (error) {
      console.error(error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'Duplicate entry' });
      }
      return res.status(500).json({
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // Get current form status for a student
  async getByRegNo(req, res) {
    try {
      const { reg_no } = req.params;
      console.log('calling get by reg no')
      console.log('registration number', reg_no)
      const status = await form_status.findOne({
        where: { reg_no },
        // include: [{ model: Student, as: 'student', attributes: ['name', 'email'] }], // if you want student info
      });

      if (!status) {
        return res.status(404).json({ message: 'No form status found for this registration number' });
      }

      return res.json({
        success: true,
        data: status
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // Optional: Get all (admin only)
  async getAll(req, res) {
    try {
      const statuses = await form_status.findAll({
        order: [['reg_no', 'ASC']],
      });
      return res.json(statuses);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },
  

async formAcceptReport(req, res) {
 /* try {
    const report = await form_status.findAll({
      attributes: [
        'teacherName',   // ← adjust this to your actual column name (e.g. 'teacher_name', 'name', etc.)

        [
          sequelize.fn('SUM', sequelize.literal(`CASE WHEN status = 1 THEN 1 ELSE 0 END`)),
          'totalAccepted'   // number of forms with status = 1 for this teacher
        ],
        [
          sequelize.fn('SUM', sequelize.literal(`CASE WHEN status = 2 THEN 1 ELSE 0 END`)),
          'totalRejected'   // number of forms with status = 2 for this teacher
        ],

        // Optional: also show total forms per teacher
        [sequelize.fn('COUNT', sequelize.col('*')), 'totalForms'],
      ],

      group: ['teacherName'],          // ← group by the teacher name column

      raw: true,                       // important → gives plain objects

      // Optional: sort by most accepted first
      order: [[sequelize.col('totalAccepted'), 'DESC']],
    });

    // If table is empty → report = []
    return res.json(report.length > 0 ? report : []);

  } catch (error) {
    console.error('Teacher status report error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }*/

    let data=[{name:"arman",totalAccepted:10,totalRejected:5},
      {name:"abdul",totalAccepted:10,totalRejected:5},
      {name:"kadir",totalAccepted:10,totalRejected:5}
    ]

    res.send({
      message:"successfully fetched",
      data:data,
      success:true
    })
}
 

};

module.exports = formStatusController;