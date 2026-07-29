const asyncHandler = require('express-async-handler');
const { semester } = require('../models');

function getRowsFromBody(body, fieldName) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && Array.isArray(body.semesters)) return body.semesters;
  if (body && Array.isArray(body[fieldName])) return body[fieldName];
  if (body && body[fieldName]) return [body[fieldName]];
  return null;
}

function normalizeSemesterRows(rows) {
  return rows
    .map((row) => {
      if (typeof row === 'string' || typeof row === 'number') {
        return { semester: String(row).trim() };
      }
      const value = row?.semester ?? row?.name;
      return { semester: String(value || '').trim() };
    })
    .filter((row) => row.semester);
}

const semesterController = {
  create: asyncHandler(async (req, res) => {
    const rows = getRowsFromBody(req.body, 'semester');

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'semesters array or semester is required',
      });
    }

    const recordsToCreate = normalizeSemesterRows(rows);

    if (recordsToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid semester is required',
      });
    }

    const records = await semester.bulkCreate(recordsToCreate, {
      validate: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Semesters created',
      count: records.length,
      data: records,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const records = await semester.findAll({
      order: [['semester', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await semester.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Semester not found',
      });
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: 'Semester deleted',
    });
  }),
};

module.exports = semesterController;
