const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const {
  exam_assessment,
  exam_scheme,
  exam_name,
  Subject,
  component,
  assessment_component,
  sequelize,
} = require('../../models');
const { httpError, toNumberOrNull, getQueryValue } = require('./examHelper');
const { getDataTable } = require('../../helper');

const assessmentInclude = [
  {
    model: exam_scheme,
    as: 'scheme',
    attributes: ['id', 'exam_name_id', 'class_id', 'term_id'],
    include: [{ model: exam_name, as: 'examNameInfo', attributes: ['id', 'exam_name'] }],
  },
  { model: Subject, as: 'subjectInfo', attributes: ['id', 'value', 'abbreviation_name'] },
  { model: component, as: 'componentInfo', attributes: ['id', 'component_name'] },
];

function readAssessment(body) {
  return {
    exam_scheme_id: toNumberOrNull(body.exam_scheme_id),
    subject_id: toNumberOrNull(body.subject_id),
    code: String(body.code ?? '').trim() || null,
    component_id: toNumberOrNull(body.component_id),
    max_marks: toNumberOrNull(body.max_marks),
    sequence: toNumberOrNull(body.sequence),
  };
}

async function validate(assessment, excludeId) {
  if (!assessment.exam_scheme_id) throw httpError(400, 'Exam scheme is required');
  if (!assessment.subject_id) throw httpError(400, 'Subject is required');
  if (!assessment.component_id) throw httpError(400, 'Component is required');
  if (assessment.code && assessment.code.length > 20) {
    throw httpError(400, 'Code must be at most 20 characters');
  }
  if (assessment.max_marks === null || assessment.max_marks <= 0) {
    throw httpError(400, 'Max marks must be greater than 0');
  }
  if (assessment.max_marks > 9999.99) throw httpError(400, 'Max marks is too large');

  const [schemeRow, subjectRow, componentRow] = await Promise.all([
    exam_scheme.findByPk(assessment.exam_scheme_id),
    Subject.findByPk(assessment.subject_id),
    component.findByPk(assessment.component_id),
  ]);
  if (!schemeRow) throw httpError(400, 'Selected exam scheme does not exist');
  if (!subjectRow) throw httpError(400, 'Selected subject does not exist');
  if (!componentRow) throw httpError(400, 'Selected component does not exist');

  if (!assessment.code) return;

  const where = {
    exam_scheme_id: assessment.exam_scheme_id,
    subject_id: assessment.subject_id,
    code: assessment.code,
  };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  if (await exam_assessment.findOne({ where })) {
    throw httpError(409, `Code "${assessment.code}" already exists for this subject in the scheme`);
  }
}

async function nextSequence(examSchemeId, subjectId) {
  const max = await exam_assessment.max('sequence', {
    where: { exam_scheme_id: examSchemeId, subject_id: subjectId },
  });
  return (max || 0) + 1;
}

function readAssessmentComponents(body) {
  const rows = body.assesmentcomponent ?? body.assessmentcomponent ?? body.assessment_components;
  if (rows === undefined || rows === null) return null;
  if (!Array.isArray(rows)) throw httpError(400, 'assesmentcomponent must be an array');

  return rows.map((row, index) => ({
    id: toNumberOrNull(row?.id),
    component_id: toNumberOrNull(row?.component_id),
    max_marks: toNumberOrNull(row?.max_marks),
    sequence: toNumberOrNull(row?.sequence) ?? index + 1,
  }));
}

async function validateAssessmentComponents(items) {
  const seen = new Set();
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const prefix = `Assessment component row ${index + 1}: `;
    if (!item.component_id) throw httpError(400, `${prefix}Component is required`);
    if (item.max_marks === null || item.max_marks <= 0) {
      throw httpError(400, `${prefix}Max marks must be greater than 0`);
    }
    if (seen.has(item.component_id)) throw httpError(409, `${prefix}Component is repeated`);
    seen.add(item.component_id);
  }

  if (!items.length) return;

  const found = await component.count({ where: { id: [...seen] } });
  if (found !== seen.size) throw httpError(400, 'One or more selected assessment components do not exist');
}

async function findExistingAssessment(body, assessment) {
  const id = toNumberOrNull(body.id);
  if (id) {
    const record = await exam_assessment.findByPk(id);
    if (!record) throw httpError(404, 'Exam assessment not found');
    return record;
  }
  return exam_assessment.findOne({
    where: {
      exam_scheme_id: assessment.exam_scheme_id,
      subject_id: assessment.subject_id,
      component_id: assessment.component_id,
    },
  });
}

async function syncAssessmentComponents(examAssessmentId, items, transaction) {
  const existing = await assessment_component.findAll({
    where: { exam_assessment_id: examAssessmentId },
    transaction,
  });
  const byId = new Map(existing.map((row) => [row.id, row]));
  const byComponent = new Map(existing.map((row) => [row.component_id, row]));

  const matched = items.map((item) => (item.id && byId.get(item.id)) || byComponent.get(item.component_id) || null);
  const keepIds = new Set(matched.filter(Boolean).map((row) => row.id));

  const removeIds = existing.filter((row) => !keepIds.has(row.id)).map((row) => row.id);
  if (removeIds.length) {
    await assessment_component.destroy({ where: { id: removeIds }, transaction });
  }

  for (let index = 0; index < items.length; index++) {
    const { id: _id, ...values } = items[index];
    if (matched[index]) {
      await matched[index].update(values, { transaction });
    } else {
      await assessment_component.create({ ...values, exam_assessment_id: examAssessmentId }, { transaction });
    }
  }
}

function findAssessment(id) {
  return exam_assessment.findByPk(id, {
    include: [
      ...assessmentInclude,
      {
        model: assessment_component,
        as: 'components',
        include: [{ model: component, as: 'componentInfo', attributes: ['id', 'component_name'] }],
      },
    ],
    order: [[{ model: assessment_component, as: 'components' }, 'sequence', 'ASC']],
  });
}

const examAssessmentController = {
  create: asyncHandler(async (req, res) => {
    const assessment = readAssessment(req.body);
    const items = readAssessmentComponents(req.body);
    const existing = await findExistingAssessment(req.body, assessment);
    await validate(assessment, existing?.id);
    await validateAssessmentComponents(items ?? []);
    if (assessment.sequence === null) {
      assessment.sequence = existing
        ? existing.sequence
        : await nextSequence(assessment.exam_scheme_id, assessment.subject_id);
    }

    const saved = await sequelize.transaction(async (transaction) => {
      if (existing) {
        await existing.update(assessment, { transaction });
        if (items) await syncAssessmentComponents(existing.id, items, transaction);
        return existing;
      }

      const row = await exam_assessment.create(assessment, { transaction });
      if (items?.length) {
        await assessment_component.bulkCreate(
          items.map(({ id: _id, ...item }) => ({ ...item, exam_assessment_id: row.id })),
          { transaction }
        );
      }
      return row;
    });

    res.status(existing ? 200 : 201).json({
      success: true,
      message: existing ? 'Exam assessment updated' : 'Exam assessment created',
      data: await findAssessment(saved.id),
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const where = {};
    for (const field of ['exam_scheme_id', 'subject_id', 'component_id']) {
      const value = toNumberOrNull(getQueryValue(req.query, field));
      if (value) where[field] = value;
    }

    const result = await getDataTable(req, exam_assessment, ['code'], where, assessmentInclude);
    res.json(result);
  }),

  getByExamSchemeId: asyncHandler(async (req, res) => {
    const examSchemeId = toNumberOrNull(req.params.examSchemeId);
    if (!examSchemeId) throw httpError(400, 'Valid exam scheme id is required');
    if (!(await exam_scheme.findByPk(examSchemeId))) throw httpError(404, 'Exam scheme not found');

    const rows = await exam_assessment.findAll({
      where: { exam_scheme_id: examSchemeId },
      include: [{ model: assessment_component, as: 'components' }],
      order: [
        ['subject_id', 'ASC'],
        ['sequence', 'ASC'],
        ['id', 'ASC'],
        [{ model: assessment_component, as: 'components' }, 'sequence', 'ASC'],
      ],
    });

    const data = rows.map((row) => ({
      id: row.id,
      exam_scheme_id: row.exam_scheme_id,
      subject_id: row.subject_id,
      code: row.code,
      component_id: row.component_id,
      max_marks: Number(row.max_marks),
      sequence: row.sequence,
      assesmentcomponent: row.components.map((item) => ({
        id: item.id,
        component_id: item.component_id,
        max_marks: Number(item.max_marks),
        sequence: item.sequence,
      })),
    }));

    res.json({ success: true, count: data.length, data });
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await findAssessment(req.params.id);
    if (!data) throw httpError(404, 'Exam assessment not found');
    res.json({ success: true, data });
  }),

  update: asyncHandler(async (req, res) => {
    const record = await exam_assessment.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Exam assessment not found');

    const assessment = readAssessment(req.body);
    await validate(assessment, record.id);
    if (assessment.sequence === null) assessment.sequence = record.sequence;

    await record.update(assessment);
    res.json({
      success: true,
      message: 'Exam assessment updated',
      data: await findAssessment(record.id),
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const record = await exam_assessment.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Exam assessment not found');

    await record.destroy();
    res.json({ success: true, message: 'Exam assessment deleted' });
  }),
};

module.exports = examAssessmentController;
