const asyncHandler = require('express-async-handler');
const {
  assignment,
  batch,
  class_master,
  division_master,
  Subject,
} = require('../../models');

const assignmentController = {
  create: asyncHandler(async (req, res) => {
    const batchId = req.body.batch ?? req.body.batchId;
    const classId = req.body.class ?? req.body.classId;
    const division = req.body.division ?? req.body.divisionId;
    const subject = req.body.subject ?? req.body.subjectId;
    const { submission_date, submission_time, title } = req.body;

    if (
      !classId ||
      !batchId ||
      !division ||
      !subject ||
      !submission_date ||
      !submission_time ||
      !title
    ) {
      return res.status(400).json({
        success: false,
        message:
          'class/classId, batch/batchId, division/divisionId, subject/subjectId, submission_date, submission_time, and title are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Assignment file is required (field name: assignment)',
      });
    }

    const assignment_url = `/uploads/assignment/${req.file.filename}`;

    const newAssignment = await assignment.create({
      class: classId,
      batch: batchId,
      division,
      subject,
      submission_date,
      submission_time,
      title,
      assignment_url,
    });

    return res.status(201).json({
      success: true,
      message: 'Assignment created',
      data: newAssignment,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const assignments = await assignment.findAll({
      include: [
        {
          model: batch,
          as: 'batchInfo',
          attributes: ['id', 'batch_name'],
        },
        {
          model: class_master,
          as: 'classInfo',
          attributes: ['id', 'class_name', 'class_code'],
        },
        {
          model: division_master,
          as: 'divisionInfo',
          attributes: ['id', 'division_name', 'division_code'],
        },
        {
          model: Subject,
          as: 'subjectInfo',
          attributes: ['id', 'value', 'subject_code', 'abbreviation_name'],
        },
      ],
      order: [['id', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  }),
};

module.exports = assignmentController;
