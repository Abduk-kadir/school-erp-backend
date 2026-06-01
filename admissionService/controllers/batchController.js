const asyncHandler = require('express-async-handler');
const { batch } = require('../models');

const batchController = {
  create: asyncHandler(async (req, res) => {
    const { batch_name } = req.body;

    if (!batch_name) {
      return res.status(400).json({
        success: false,
        message: 'batch_name is required',
      });
    }

    const newBatch = await batch.create({ batch_name });

    return res.status(201).json({
      success: true,
      message: 'Batch created',
      data: newBatch,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const batches = await batch.findAll({
      order: [['id', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: batches.length,
      data: batches,
    });
  }),
};

module.exports = batchController;
