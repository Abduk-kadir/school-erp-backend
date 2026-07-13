const asyncHandler = require('express-async-handler');
const { designation } = require('../models');

function getRowsFromBody(body, fieldName) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && Array.isArray(body.designations)) return body.designations;
  if (body && Array.isArray(body[fieldName])) return body[fieldName];
  if (body && body[fieldName]) return [body[fieldName]];
  return null;
}

function normalizeDesignationRows(rows) {
  return rows
    .map((row) => {
      if (typeof row === 'string') {
        return { designation_name: row.trim() };
      }
      const name = row?.designation_name ?? row?.designationName ?? row?.name;
      return { designation_name: String(name || '').trim() };
    })
    .filter((row) => row.designation_name);
}

const designationController = {
  create: asyncHandler(async (req, res) => {
    const rows = getRowsFromBody(req.body, 'designation_name');

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'designations array or designation_name is required',
      });
    }

    const recordsToCreate = normalizeDesignationRows(rows);

    if (recordsToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid designation_name is required',
      });
    }

    const records = await designation.bulkCreate(recordsToCreate, {
      validate: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Designations created',
      count: records.length,
      data: records,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const records = await designation.findAll({
      order: [['designation_name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await designation.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Designation not found',
      });
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: 'Designation deleted',
    });
  }),
};

module.exports = designationController;
