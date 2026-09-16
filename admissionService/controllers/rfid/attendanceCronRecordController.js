const asyncHandler = require('express-async-handler');
const {
  attendancecronerecord,
  batch,
  class_master,
  division_master,
} = require('../../models');

const attendanceCronRecordController = {
  create: asyncHandler(async (req, res) => {
    const batchid = req.body.batchid ?? req.body.batchId;
    const classid = req.body.classid ?? req.body.classId;
    const divisionid = req.body.divisionid ?? req.body.divisionId;
    const isrun = req.body.isrun ?? req.body.isRun ?? false;

    if (!batchid || !classid || !divisionid) {
      return res.status(400).json({
        success: false,
        message: 'batchid, classid, and divisionid are required',
      });
    }

    const record = await attendancecronerecord.create({
      batchid,
      classid,
      divisionid,
      isrun: Boolean(isrun),
    });

    return res.status(201).json({
      success: true,
      message: 'Attendance cron record created',
      data: record,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const records = await attendancecronerecord.findAll({
      include: [
        { model: batch, as: 'batchInfo', attributes: ['id', 'batch_name', 'starttime', 'endtime'] },
        { model: class_master, as: 'classInfo', attributes: ['id', 'class_name'] },
        { model: division_master, as: 'divisionInfo', attributes: ['id', 'division_name'] },
      ],
      order: [['id', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await attendancecronerecord.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
      });
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: 'Attendance cron record deleted',
    });
  }),
};

module.exports = attendanceCronRecordController;
