const asyncHandler = require('express-async-handler');
const { title } = require('../models');

const titleController = {
  create: asyncHandler(async (req, res) => {
    const body = req.body || {};
    const titleValue = body.title;

    if (!titleValue || !String(titleValue).trim()) {
      return res.status(400).json({
        success: false,
        message: 'title is required',
      });
    }

    const data = await title.create({
      title: String(titleValue).trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Title created',
      data,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const data = await title.findAll({
      order: [['id', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const body = req.body || {};

    const record = await title.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Title not found',
      });
    }

    if (body.title === undefined || !String(body.title).trim()) {
      return res.status(400).json({
        success: false,
        message: 'title is required',
      });
    }

    await record.update({ title: String(body.title).trim() });

    return res.status(200).json({
      success: true,
      message: 'Title updated',
      data: record,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const record = await title.findByPk(id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Title not found',
      });
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: 'Title deleted',
    });
  }),
};

module.exports = titleController;
