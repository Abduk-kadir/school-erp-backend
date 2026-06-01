const asyncHandler = require('express-async-handler');
const { timetable, batch, class_master, division_master } = require('../../models');

const timetableController = {
  create: asyncHandler(async (req, res) => {
    const batchId = req.body.batch ?? req.body.batchId;
    const classId = req.body.class ?? req.body.classId;
    const division = req.body.division ?? req.body.divisionId;
    const { valid_from } = req.body;

    if (!batchId || !classId || !division || !valid_from) {
      return res.status(400).json({
        success: false,
        message:
          'batch/batchId, class/classId, division/divisionId, and valid_from are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Timetable file is required (field name: timetable)',
      });
    }

    const timetable_url = `/uploads/timetable/${req.file.filename}`;

    const newTimetable = await timetable.create({
      batch: batchId,
      class: classId,
      division,
      valid_from,
      timetable_url,
    });

    return res.status(201).json({
      success: true,
      message: 'Timetable created',
      data: newTimetable,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const timetables = await timetable.findAll({
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
      ],
      order: [['id', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: timetables.length,
      data: timetables,
    });
  }),
};

module.exports = timetableController;
