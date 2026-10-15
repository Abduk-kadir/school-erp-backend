const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { exam_name, exam_scheme } = require('../../models');
const { httpError } = require('./examHelper');
const { getDataTable } = require('../../helper');

function readExamName(body) {
  const name = String(body.exam_name ?? '').trim();
  if (!name) throw httpError(400, 'Exam name is required');
  if (name.length > 100) throw httpError(400, 'Exam name must be at most 100 characters');
  return name;
}

async function ensureUniqueName(name, excludeId) {
  const where = { exam_name: name };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  if (await exam_name.findOne({ where })) {
    throw httpError(409, `Exam name "${name}" already exists`);
  }
}

const examNameController = {
  create: asyncHandler(async (req, res) => {
    const name = readExamName(req.body);
    await ensureUniqueName(name);

    const data = await exam_name.create({ exam_name: name });
    res.status(201).json({ success: true, message: 'Exam name created', data });
  }),

  getAll: asyncHandler(async (req, res) => {
    const result = await getDataTable(req, exam_name, ['exam_name']);
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await exam_name.findByPk(req.params.id);
    if (!data) throw httpError(404, 'Exam name not found');
    res.json({ success: true, data });
  }),

  update: asyncHandler(async (req, res) => {
    const record = await exam_name.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Exam name not found');

    const name = readExamName(req.body);
    await ensureUniqueName(name, record.id);

    await record.update({ exam_name: name });
    res.json({ success: true, message: 'Exam name updated', data: record });
  }),

  delete: asyncHandler(async (req, res) => {
    const record = await exam_name.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Exam name not found');

    const usedBy = await exam_scheme.count({ where: { exam_name_id: record.id } });
    if (usedBy) throw httpError(409, `Exam name is used by ${usedBy} exam scheme(s) and cannot be deleted`);

    await record.destroy();
    res.json({ success: true, message: 'Exam name deleted' });
  }),
};

module.exports = examNameController;
