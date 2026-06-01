const asyncHandler = require('express-async-handler');
const {
  notes,
  batch,
  class_master,
  division_master,
  Subject,
} = require('../../models');

const notesController = {
  create: asyncHandler(async (req, res) => {
    const batchId = req.body.batch ?? req.body.batchId;
    const classId = req.body.class ?? req.body.classId;
    const division = req.body.division ?? req.body.divisionId;
    const subject = req.body.subject ?? req.body.subjectId;
    const { topic, chapter, url } = req.body;

    if (!classId || !batchId || !division || !subject || !topic || !chapter || !url) {
      return res.status(400).json({
        success: false,
        message:
          'class/classId, batch/batchId, division/divisionId, subject/subjectId, topic, chapter, and url are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Notes file is required (field name: notes)',
      });
    }

    const notes_url = `/uploads/notes/${req.file.filename}`;

    const newNotes = await notes.create({
      class: classId,
      batch: batchId,
      division,
      subject,
      topic,
      chapter,
      url,
      notes_url,
    });

    return res.status(201).json({
      success: true,
      message: 'Notes created',
      data: newNotes,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const allNotes = await notes.findAll({
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
      count: allNotes.length,
      data: allNotes,
    });
  }),
};

module.exports = notesController;
