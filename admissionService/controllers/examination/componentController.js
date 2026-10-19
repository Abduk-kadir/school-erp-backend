const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { component, exam_assessment, assessment_component } = require('../../models');
const { httpError, getQueryValue } = require('./examHelper');
const { getDataTable } = require('../../helper');

function readComponent(body) {
  const component_name = String(body.component_name ?? '').trim();
  if (!component_name) throw httpError(400, 'Component name is required');
  if (component_name.length > 100) throw httpError(400, 'Component name must be at most 100 characters');

  const type = body.type === undefined || body.type === null
    ? null
    : String(body.type).trim() || null;
  if (type && type.length > 100) throw httpError(400, 'Type must be at most 100 characters');

  return { component_name, type };
}

async function ensureUniqueName(name, excludeId) {
  const where = { component_name: name };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  if (await component.findOne({ where })) {
    throw httpError(409, `Component "${name}" already exists`);
  }
}

const componentController = {
  create: asyncHandler(async (req, res) => {
    const payload = readComponent(req.body);
    await ensureUniqueName(payload.component_name);

    const data = await component.create(payload);
    res.status(201).json({ success: true, message: 'Component created', data });
  }),

  getAll: asyncHandler(async (req, res) => {
    const where = {};
    const type = getQueryValue(req.query, 'type');
    if (type !== '') where.type = type;

    const result = await getDataTable(req, component, ['component_name', 'type'], where);
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await component.findByPk(req.params.id);
    if (!data) throw httpError(404, 'Component not found');
    res.json({ success: true, data });
  }),

  update: asyncHandler(async (req, res) => {
    const record = await component.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Component not found');

    const payload = readComponent(req.body);
    await ensureUniqueName(payload.component_name, record.id);

    await record.update(payload);
    res.json({ success: true, message: 'Component updated', data: record });
  }),

  delete: asyncHandler(async (req, res) => {
    const record = await component.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Component not found');

    const where = { component_id: record.id };
    const [assessmentCount, itemCount] = await Promise.all([
      exam_assessment.count({ where }),
      assessment_component.count({ where }),
    ]);
    if (assessmentCount || itemCount) {
      throw httpError(409, 'Component is used in exam assessments and cannot be deleted');
    }

    await record.destroy();
    res.json({ success: true, message: 'Component deleted' });
  }),
};

module.exports = componentController;
