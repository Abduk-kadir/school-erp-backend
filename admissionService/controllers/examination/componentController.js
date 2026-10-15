const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { component, exam_assessment, assessment_component } = require('../../models');
const { httpError } = require('./examHelper');
const { getDataTable } = require('../../helper');

function readComponentName(body) {
  const name = String(body.component_name ?? '').trim();
  if (!name) throw httpError(400, 'Component name is required');
  if (name.length > 100) throw httpError(400, 'Component name must be at most 100 characters');
  return name;
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
    const component_name = readComponentName(req.body);
    await ensureUniqueName(component_name);

    const data = await component.create({ component_name });
    res.status(201).json({ success: true, message: 'Component created', data });
  }),

  getAll: asyncHandler(async (req, res) => {
    const result = await getDataTable(req, component, ['component_name']);
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

    const component_name = readComponentName(req.body);
    await ensureUniqueName(component_name, record.id);

    await record.update({ component_name });
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
