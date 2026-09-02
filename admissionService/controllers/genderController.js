const asyncHandler = require('express-async-handler');
const { gender } = require('../models');
const { getDataTable } = require('../helper');

const genderController = {
  create: asyncHandler(async (req, res) => {
    const { gender_name } = req.body || {};

    if (!gender_name || !String(gender_name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'gender_name is required',
      });
    }

    const data = await gender.create({
      gender_name: String(gender_name).trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Gender created',
      data,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const result = await getDataTable(req, gender, ['gender_name']);
    res.json(result);
  }),

  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { gender_name } = req.body || {};

    const record = await gender.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Gender not found',
      });
    }

    if (gender_name === undefined || !String(gender_name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'gender_name is required',
      });
    }

    await record.update({ gender_name: String(gender_name).trim() });

    return res.status(200).json({
      success: true,
      message: 'Gender updated',
      data: record,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const record = await gender.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Gender not found',
      });
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: 'Gender deleted',
    });
  }),
};

module.exports = genderController;
