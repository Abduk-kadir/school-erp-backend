const asyncHandler = require('express-async-handler');
const { student_subject, PersonalInformation, class_master, Program, Subject, ElectiveBasket } = require('../models');
const { Op } = require('sequelize');

exports.getAllStudentSubjects = asyncHandler(async (req, res) => {
  console.log('this is calling')
  const records = await student_subject.findAll({
    include: [

      { model: class_master, as: 'class', attributes: ['id', 'class_name'] },
      { model: Program, as: 'program', attributes: ['id', 'program_name'] },
      { model: Subject, as: 'subject', attributes: ['id', 'value', 'subject_code'] },
      { model: ElectiveBasket, as: 'electiveBasket', attributes: ['id'] },
    ],
  });

  return res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  });
});

exports.getAllStudentSubjectsbyregids = asyncHandler(async (req, res) => {
  const { allRegNo } = req.body;

  const records = await student_subject.findAll({
    where: {

      student_reg_no: {
        [Op.in]: allRegNo,
      },
    },
    attributes: {
      exclude: ['createdAt', 'updatedAt'],   // ← removes these two fields
    },
  });

  return res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  });
});

// Get all subjects assigned to a specific student (useful for student dashboard/admission)
exports.getStudentSubjects = asyncHandler(async (req, res) => {
  const { student_reg_no } = req.params;

  const records = await student_subject.findAll({
    where: { student_reg_no: parseInt(student_reg_no) },
    include: [

      { model: Subject, as: 'subject' },

    ],

  });

  return res.status(200).json({
    success: true,
    count: records.length,
    data: records,
  });
});

// Create single subject assignment
exports.createStudentSubject = asyncHandler(async (req, res) => {
  const {
    student_reg_no,
    class_id,
    program_id,
    semester,
    subject_id,
    elective_basket_id,
  } = req.body;

  if (!student_reg_no || !class_id || !semester || !subject_id) {
    return res.status(400).json({
      success: false,
      message: 'student_reg_no, class_id, semester, subject_id are required',
    });
  }

  const record = await student_subject.create({
    student_reg_no,
    class_id,
    program_id: program_id || null,
    semester,
    subject_id,
    elective_basket_id: elective_basket_id || null,
  });

  return res.status(201).json({ success: true, data: record });
});

// Bulk create (assign multiple subjects to a student at once - perfect for admission)
exports.bulkCreateStudentSubjects = asyncHandler(async (req, res) => {
  const { assignments } = req.body;
  console.log('assignment is*************************************', assignments)

  if (!Array.isArray(assignments) || assignments.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'assignments must be a non-empty array',
    });
  }

  // Validate each entry
  for (const ass of assignments) {
    if (!ass.student_reg_no || !ass.class_id || !ass.subject_id) {
      return res.status(400).json({
        success: false,
        message: 'Each assignment must have student_reg_no, class_id, subject_id',
      });
    }
  }

  const created = await student_subject.bulkCreate(assignments, {
    validate: true,
    returning: true,
  });

  return res.status(201).json({
    success: true,
    count: created.length,
    data: created,
  });
});

// Bulk update: remove elective subjects for student, keep compulsory (null basket), then insert all
exports.bulkUpdateStudentSubjects = asyncHandler(async (req, res) => {
  const { assignments } = req.body;

  if (!Array.isArray(assignments) || assignments.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'assignments must be a non-empty array',
    });
  }

  const regNos = [...new Set(assignments.map((a) => a.student_reg_no).filter((v) => v != null))];

  if (regNos.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'student_reg_no is required in assignments',
    });
  }

  // Delete only elective subjects (elective_bbasket_id not null). Keep compulsory (null).
  await student_subject.destroy({
    where: {
      student_reg_no: { [Op.in]: regNos },
      elective_bbasket_id: { [Op.ne]: null },
    },
  });

  const rows = assignments.map(({ id, ...data }) => data);
  const created = await student_subject.bulkCreate(rows, {
    validate: true,
    returning: true,
  });

  return res.status(200).json({
    success: true,
    count: created.length,
    data: created,
  });
});

// Update single assignment
exports.updateStudentSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const record = await student_subject.findByPk(id);

  if (!record) {
    return res.status(404).json({ success: false, message: 'Assignment not found' });
  }

  await record.update(req.body);

  return res.status(200).json({ success: true, data: record });
});

// Delete single assignment
exports.deleteStudentSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const record = await student_subject.findByPk(id);

  if (!record) {
    return res.status(404).json({ success: false, message: 'Assignment not found' });
  }

  await record.destroy();

  return res.status(200).json({ success: true, message: 'Assignment deleted' });
});
