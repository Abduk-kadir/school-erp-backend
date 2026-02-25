const { form_status, PersonalInformation, student_subject,Subject } = require('../models')
const { Op } = require('sequelize');
const { getDataTable } = require('../helper');

const filledFormStudensts = async (req, res) => {
  try {
    const include = [
      {
        model: form_status,
        as: 'formStatus',
        attributes: ['current_step', 'form_status'],
        required: false,
      },
      {
        model: student_subject,
        as: 'studentSubjects',
        attributes: ['semester', 'subject_id', 'elective_bbasket_id'],
        required: false,
        include: [
          {
            model: Subject,
            as: 'subject',
            attributes: ['id', 'value'],
            required: false,
          }
        ]
      }
    ];

    // Searchable fields, including associations via $ notation
    const searchFields = [
      'first_name',
      'last_name',
      'reg_no',
      'class'
     
    ];

    // Pass `include` to getDataTable
    const result = await getDataTable(req, PersonalInformation, searchFields, {}, include);

    return res.status(200).json({
      success: true,
      message: 'Students with subjects fetched successfully',
      ...result
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', err: err.message });
  }
};


const formAccepted = async (req, res) => {
  try {
    // Validate input
    if (!req.body.reg_no) {
      return res.status(400).json({
        success: false,
        message: 'Registration number is required'
      });
    }
    console.log('registation number is***********:',req.body.reg_no)
    console.log('Checking DB for reg_no:', req.body.reg_no);
const student = await form_status.findOne({ where: { reg_no: req.body.reg_no } });
console.log('Found student:', student);
    // Update the form status using Sequelize
    const [affectedRows] = await form_status.update(
      { form_status: 1 },
      { where: { reg_no: req.body.reg_no } }
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or already accepted'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student form accepted successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', err: err.message });
  }
};

const editByStudent = async (req, res) => {
  try {
    // Validate input
    if (!req.body.reg_no) {
      return res.status(400).json({
        success: false,
        message: 'Registration number is required'
      });
    }
    console.log('registation number is***********:',req.body.reg_no)
    console.log('Checking DB for reg_no:', req.body.reg_no);
const student = await form_status.findOne({ where: { reg_no: req.body.reg_no } });
console.log('Found student:', student);
    // Update the form status using Sequelize
    const [affectedRows] = await form_status.update(
      { form_status: 0 ,current_step:2},
      { where: { reg_no: req.body.reg_no } }
    );

    if (affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Student not found or already accepted'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Student form accepted successfully'
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', err: err.message });
  }
};













module.exports={
    filledFormStudensts,
    formAccepted,
    editByStudent

}