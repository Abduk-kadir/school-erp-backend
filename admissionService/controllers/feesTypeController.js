const asyncHandler = require('express-async-handler');
const { FeesType } = require('../models');

exports.create = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (name == null || String(name).trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'name is required',
    });
  }

  const created = await FeesType.create({ name: String(name).trim() });

  return res.status(201).json({
    success: true,
    message: 'Fees type created successfully',
    data: created,
  });
});

exports.getAll = asyncHandler(async (req, res) => {
  const data = await FeesType.findAll({ order: [['id', 'ASC']] });
  return res.json({ success: true, data });
});

exports.delete = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const record = await FeesType.findByPk(id);
  if (!record) {
    return res.status(404).json({
      success: false,
      message: 'Fees type not found',
    });
  }

  await record.destroy();

  return res.json({
    success: true,
    message: 'Fees type deleted successfully',
  });
});
