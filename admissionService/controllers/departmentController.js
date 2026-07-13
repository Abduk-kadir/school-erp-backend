const asyncHandler = require('express-async-handler');
const { department } = require('../models');

function getRowsFromBody(body, fieldName) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && Array.isArray(body.departments)) return body.departments;
  if (body && Array.isArray(body[fieldName])) return body[fieldName];
  if (body && body[fieldName]) return [body[fieldName]];
  return null;
}

function normalizeDepartmentRows(rows) {
  return rows
    .map((row) => {
      if (typeof row === 'string') {
        return { department_name: row.trim() };
      }
      const name = row?.department_name ?? row?.departmentName ?? row?.name;
      return { department_name: String(name || '').trim() };
    })
    .filter((row) => row.department_name);
}

const departmentController = {
  create: asyncHandler(async (req, res) => {
    const rows = getRowsFromBody(req.body, 'department_name');

    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'departments array or department_name is required',
      });
    }

    const recordsToCreate = normalizeDepartmentRows(rows);

    if (recordsToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid department_name is required',
      });
    }

    const records = await department.bulkCreate(recordsToCreate, {
      validate: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Departments created',
      count: records.length,
      data: records,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const records = await department.findAll({
      order: [['department_name', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await department.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: 'Department deleted',
    });
  }),
};

module.exports = departmentController;
