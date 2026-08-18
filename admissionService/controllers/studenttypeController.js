const asyncHandler = require('express-async-handler');
const { studenttype } = require('../models');
const { getDataTable } = require('../helper');

function getRowsFromBody(body, fieldName) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && Array.isArray(body.studenttypes)) return body.studenttypes;
  if (body && Array.isArray(body[fieldName])) return body[fieldName];
  if (body && body[fieldName]) return [body[fieldName]];
  return null;
}

function normalizeStudenttypeRows(rows) {
  return rows
    .map((row) => {
      if (typeof row === 'string' || typeof row === 'number') {
        return { studenttype: String(row).trim() };
      }
      const value = row?.studenttype ?? row?.name;
      return { studenttype: String(value || '').trim() };
    })
    .filter((row) => row.studenttype);
}

const studenttypeController = {
  create: asyncHandler(async (req, res) => {
    const rows = getRowsFromBody(req.body, 'studenttype');

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'studenttypes array or studenttype is required',
      });
    }

    const recordsToCreate = normalizeStudenttypeRows(rows);

    if (recordsToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid studenttype is required',
      });
    }

    const records = await studenttype.bulkCreate(recordsToCreate, {
      validate: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Student types created',
      count: records.length,
      data: records,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    
    const result = await getDataTable(req, studenttype, ['studenttype']);
    res.json(result);

  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await studenttype.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Student type not found',
      });
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: 'Student type deleted',
    });
  }),
};

module.exports = studenttypeController;
