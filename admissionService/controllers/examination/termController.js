const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { term, exam_scheme } = require('../../models');
const { httpError } = require('./examHelper');
const { getDataTable } = require('../../helper');

function readTermName(body) {
  const name = String(body.term_name ?? '').trim();
  if (!name) throw httpError(400, 'Term name is required');
  if (name.length > 100) throw httpError(400, 'Term name must be at most 100 characters');
  return name;
}

async function ensureUniqueName(name, excludeId) {
  const where = { term_name: name };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  if (await term.findOne({ where })) {
    throw httpError(409, `Term "${name}" already exists`);
  }
}

const termController = {
  create: asyncHandler(async (req, res) => {
    const term_name = readTermName(req.body);
    await ensureUniqueName(term_name);

    const data = await term.create({ term_name });
    res.status(201).json({ success: true, message: 'Term created', data });
  }),

  getAll: asyncHandler(async (req, res) => {
    const result = await getDataTable(req, term, ['term_name']);
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await term.findByPk(req.params.id);
    if (!data) throw httpError(404, 'Term not found');
    res.json({ success: true, data });
  }),

  update: asyncHandler(async (req, res) => {
    const record = await term.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Term not found');

    const term_name = readTermName(req.body);
    await ensureUniqueName(term_name, record.id);

    await record.update({ term_name });
    res.json({ success: true, message: 'Term updated', data: record });
  }),

  delete: asyncHandler(async (req, res) => {
    const record = await term.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Term not found');

    const usedBy = await exam_scheme.count({ where: { term_id: record.id } });
    if (usedBy) throw httpError(409, `Term is used by ${usedBy} exam scheme(s) and cannot be deleted`);

    await record.destroy();
    res.json({ success: true, message: 'Term deleted' });
  }),
};

module.exports = termController;
