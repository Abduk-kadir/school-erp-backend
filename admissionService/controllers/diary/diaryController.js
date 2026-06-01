const asyncHandler = require('express-async-handler');
const {
  diary,
  batch,
  class_master,
  division_master,
  Subject,
} = require('../../models');

const diaryController = {
  create: asyncHandler(async (req, res) => {
    const {
      class: classId,
      batch: batchId,
      division,
      subject,
      message,
    } = req.body;

    if (!classId || !batchId || !division || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'class, batch, division, subject, and message are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Diary file is required (field name: diary)',
      });
    }

    const diary_url = `/uploads/diary/${req.file.filename}`;

    const newDiary = await diary.create({
      class: classId,
      batch: batchId,
      division,
      subject,
      message,
      diary_url,
    });

    return res.status(201).json({
      success: true,
      message: 'Diary created',
      data: newDiary,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const diaries = await diary.findAll({
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
      count: diaries.length,
      data: diaries,
    });
  }),
};

module.exports = diaryController;
