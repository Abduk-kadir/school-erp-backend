const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { assessment_group, exam_assessment } = require('../../models');
const { httpError } = require('./examHelper');
const { getDataTable } = require('../../helper');

function readGroup(body) {
  const group = String(body.group ?? '').trim();
  if (!group) throw httpError(400, 'Group is required');
  if (group.length > 100) throw httpError(400, 'Group must be at most 100 characters');
  return group;
}

async function ensureUniqueGroup(group, excludeId) {
  const where = { group };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  if (await assessment_group.findOne({ where })) {
    throw httpError(409, `Group "${group}" already exists`);
  }
}

const assessmentGroupController = {
  create: asyncHandler(async (req, res) => {
    const group = readGroup(req.body);
    await ensureUniqueGroup(group);

    const data = await assessment_group.create({ group });
    res.status(201).json({ success: true, message: 'Assessment group created', data });
  }),

  getAll: asyncHandler(async (req, res) => {
    const result = await getDataTable(req, assessment_group, ['group']);
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await assessment_group.findByPk(req.params.id);
    if (!data) throw httpError(404, 'Assessment group not found');
    res.json({ success: true, data });
  }),

  update: asyncHandler(async (req, res) => {
    const record = await assessment_group.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Assessment group not found');

    const group = readGroup(req.body);
    await ensureUniqueGroup(group, record.id);

    await record.update({ group });
    res.json({ success: true, message: 'Assessment group updated', data: record });
  }),

  delete: asyncHandler(async (req, res) => {
    const record = await assessment_group.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Assessment group not found');

    const usedBy = await exam_assessment.count({ where: { group_id: record.id } });
    if (usedBy) throw httpError(409, `Group is used by ${usedBy} exam assessment(s) and cannot be deleted`);

    await record.destroy();
    res.json({ success: true, message: 'Assessment group deleted' });
  }),
};

module.exports = assessmentGroupController;
