const asyncHandler = require('express-async-handler');
const {
  staffclassmap,
  StaffRegistration,
  class_master,
  division_master,
} = require('../models');

const staffclassmapController = {
  create: asyncHandler(async (req, res) => {
    const body = req.body || {};
    const staffid = body.staffid ?? body.staffId;
    const classid = body.classid ?? body.classId;
    const divisionid = body.divisionid ?? body.divisionId ?? body.divisonid;

    if (!staffid || !classid || !divisionid) {
      return res.status(400).json({
        success: false,
        message: 'staffid, classid and divisionid are required',
      });
    }

    const data = await staffclassmap.create({
      staffid,
      classid,
      divisionid,
    });

    return res.status(201).json({
      success: true,
      message: 'Staff class map created',
      data,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const data = await staffclassmap.findAll({
      include: [
        {
          model: StaffRegistration,
          as: 'staffInfo',
          attributes: ['id', 'surname', 'firstname', 'lastname', 'email'],
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
      count: data.length,
      data,
    });
  }),

  edit: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const body = req.body || {};

    const record = await staffclassmap.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Staff class map not found',
      });
    }

    const updates = {};
    if (body.staffid !== undefined || body.staffId !== undefined) {
      updates.staffid = body.staffid ?? body.staffId;
    }
    if (body.classid !== undefined || body.classId !== undefined) {
      updates.classid = body.classid ?? body.classId;
    }
    if (
      body.divisionid !== undefined ||
      body.divisionId !== undefined ||
      body.divisonid !== undefined
    ) {
      updates.divisionid = body.divisionid ?? body.divisionId ?? body.divisonid;
    }

    await record.update(updates);

    return res.status(200).json({
      success: true,
      message: 'Staff class map updated',
      data: record,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const record = await staffclassmap.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Staff class map not found',
      });
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: 'Staff class map deleted',
    });
  }),
};

module.exports = staffclassmapController;
