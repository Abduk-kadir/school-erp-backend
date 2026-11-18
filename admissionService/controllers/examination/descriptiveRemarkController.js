const asyncHandler = require('express-async-handler');
const { descriptive_remark } = require('../../models');
const { httpError } = require('./examHelper');
const { getDataTable } = require('../../helper');

const descriptiveRemarkController = {
  create: asyncHandler(async (req, res) => {
    const remark = req.body.remark != null ? String(req.body.remark).trim() : '';
    if (!remark) throw httpError(400, 'Remark is required');

    const data = await descriptive_remark.create({ remark });
    res.status(201).json({ success: true, message: 'Descriptive remark created', data });
  }),

  getAll: asyncHandler(async (req, res) => {
    const result = await getDataTable(req, descriptive_remark, ['remark']);
    res.json(result);
  }),

  delete: asyncHandler(async (req, res) => {
    const record = await descriptive_remark.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Descriptive remark not found');

    await record.destroy();
    res.json({ success: true, message: 'Descriptive remark deleted' });
  }),
  
};

module.exports = descriptiveRemarkController;
