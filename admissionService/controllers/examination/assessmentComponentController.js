const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { assessment_component, exam_assessment, component } = require('../../models');
const { httpError, toNumberOrNull, getQueryValue } = require('./examHelper');
const { getDataTable } = require('../../helper');

const itemInclude = [
  {
    model: exam_assessment,
    as: 'assessment',
    attributes: ['id', 'exam_scheme_id', 'subject_id', 'code', 'group_id', 'max_marks'],
  },
  { model: component, as: 'componentInfo', attributes: ['id', 'component_name'] },
];

function readItem(body) {
  return {
    exam_assessment_id: toNumberOrNull(body.exam_assessment_id),
    component_id: toNumberOrNull(body.component_id),
    max_marks: toNumberOrNull(body.max_marks),
    sequence: toNumberOrNull(body.sequence),
  };
}

async function validate(item, excludeId) {
  if (!item.exam_assessment_id) throw httpError(400, 'Exam assessment is required');
  if (!item.component_id) throw httpError(400, 'Component is required');
  if (item.max_marks === null || item.max_marks <= 0) {
    throw httpError(400, 'Max marks must be greater than 0');
  }

  const [assessmentRow, componentRow] = await Promise.all([
    exam_assessment.findByPk(item.exam_assessment_id),
    component.findByPk(item.component_id),
  ]);
  if (!assessmentRow) throw httpError(400, 'Selected exam assessment does not exist');
  if (!componentRow) throw httpError(400, 'Selected component does not exist');

  const others = { exam_assessment_id: item.exam_assessment_id };
  if (excludeId) others.id = { [Op.ne]: excludeId };

  if (await assessment_component.findOne({ where: { ...others, component_id: item.component_id } })) {
    throw httpError(409, `Component "${componentRow.component_name}" is already added to this assessment`);
  }
}

async function nextSequence(examAssessmentId) {
  const max = await assessment_component.max('sequence', {
    where: { exam_assessment_id: examAssessmentId },
  });
  return (max || 0) + 1;
}

function findItem(id) {
  return assessment_component.findByPk(id, { include: itemInclude });
}

const assessmentComponentController = {
  create: asyncHandler(async (req, res) => {
    const item = readItem(req.body);
    await validate(item);
    if (item.sequence === null) item.sequence = await nextSequence(item.exam_assessment_id);

    const created = await assessment_component.create(item);
    res.status(201).json({
      success: true,
      message: 'Assessment component created',
      data: await findItem(created.id),
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const where = {};
    for (const field of ['exam_assessment_id', 'component_id']) {
      const value = toNumberOrNull(getQueryValue(req.query, field));
      if (value) where[field] = value;
    }

    const result = await getDataTable(req, assessment_component, [], where, itemInclude);
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await findItem(req.params.id);
    if (!data) throw httpError(404, 'Assessment component not found');
    res.json({ success: true, data });
  }),

  update: asyncHandler(async (req, res) => {
    const record = await assessment_component.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Assessment component not found');

    const item = readItem(req.body);
    await validate(item, record.id);
    if (item.sequence === null) item.sequence = record.sequence;

    await record.update(item);
    res.json({
      success: true,
      message: 'Assessment component updated',
      data: await findItem(record.id),
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const record = await assessment_component.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Assessment component not found');

    await record.destroy();
    res.json({ success: true, message: 'Assessment component deleted' });
  }),
};

module.exports = assessmentComponentController;
