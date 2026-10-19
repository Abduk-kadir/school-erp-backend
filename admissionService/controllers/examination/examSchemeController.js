const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const {
  exam_scheme,
  exam_name,
  class_master,
  term,
  Program,
  semester,
  exam_assessment,
  assessment_component,
  Subject,
  component,
  sequelize,
} = require('../../models');
const { httpError, toNumberOrNull, getQueryValue } = require('./examHelper');
const { getDataTable } = require('../../helper');

const schemeInclude = [
  { model: exam_name, as: 'examNameInfo', attributes: ['id', 'exam_name'] },
  { model: class_master, as: 'classInfo', attributes: ['id', 'class_name'] },
  { model: term, as: 'termInfo', attributes: ['id', 'term_name'] },
  { model: Program, as: 'programInfo', attributes: ['id', 'program_name'] },
  { model: semester, as: 'semesterInfo', attributes: ['id', 'semester'] },
];

function getRowsFromBody(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  return null;
}

function schemeKey(scheme) {
  return [scheme.exam_name_id, scheme.class_id, scheme.term_id, scheme.program_id, scheme.semester_id].join('|');
}

function readScheme(body) {
  return {
    exam_name_id: toNumberOrNull(body.exam_name_id),
    class_id: toNumberOrNull(body.class_id),
    term_id: toNumberOrNull(body.term_id),
    program_id: toNumberOrNull(body.program_id),
    semester_id: toNumberOrNull(body.semester_id),
  };
}

async function validate(scheme, excludeId) {
  if (!scheme.exam_name_id) throw httpError(400, 'Exam name is required');
  if (!scheme.class_id) throw httpError(400, 'Class is required');
  if (!scheme.term_id) throw httpError(400, 'Term is required');

  const [examNameRow, classRow, termRow, programRow, semesterRow] = await Promise.all([
    exam_name.findByPk(scheme.exam_name_id),
    class_master.findByPk(scheme.class_id),
    term.findByPk(scheme.term_id),
    scheme.program_id ? Program.findByPk(scheme.program_id) : true,
    scheme.semester_id ? semester.findByPk(scheme.semester_id) : true,
  ]);
  if (!examNameRow) throw httpError(400, 'Selected exam name does not exist');
  if (!classRow) throw httpError(400, 'Selected class does not exist');
  if (!termRow) throw httpError(400, 'Selected term does not exist');
  if (!programRow) throw httpError(400, 'Selected program does not exist');
  if (!semesterRow) throw httpError(400, 'Selected semester does not exist');

  const where = {
    exam_name_id: scheme.exam_name_id,
    class_id: scheme.class_id,
    term_id: scheme.term_id,
    program_id: scheme.program_id,
    semester_id: scheme.semester_id,
  };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  if (await exam_scheme.findOne({ where })) {
    throw httpError(409, `Scheme "${examNameRow.exam_name}" already exists for this class and term`);
  }

  return examNameRow;
}

function findScheme(id) {
  return exam_scheme.findByPk(id, { include: schemeInclude });
}

const examSchemeController = {
  create: asyncHandler(async (req, res) => {
    const rows = getRowsFromBody(req.body);
    const payload = (rows ?? [req.body]).map((row) => readScheme(row || {}));
    if (!payload.length) throw httpError(400, 'At least one exam scheme is required');

    const seen = new Set();
    for (let index = 0; index < payload.length; index++) {
      const scheme = payload[index];
      const prefix = payload.length > 1 ? `Row ${index + 1}: ` : '';
      let examNameRow;
      try {
        examNameRow = await validate(scheme);
      } catch (err) {
        err.message = prefix + err.message;
        throw err;
      }
      const key = schemeKey(scheme);
      if (seen.has(key)) {
        throw httpError(409, `${prefix}Scheme "${examNameRow.exam_name}" is repeated for the same class and term`);
      }
      seen.add(key);
    }

    const created = await sequelize.transaction((transaction) =>
      exam_scheme.bulkCreate(payload, { transaction })
    );

    const data = await exam_scheme.findAll({
      where: { id: created.map((row) => row.id) },
      include: schemeInclude,
      order: [['id', 'ASC']],
    });
    res.status(201).json({
      success: true,
      message: `${data.length} exam scheme(s) created`,
      count: data.length,
      data,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const where = {};
    for (const field of ['exam_name_id', 'class_id', 'term_id', 'program_id', 'semester_id']) {
      const value = toNumberOrNull(getQueryValue(req.query, field));
      if (value) where[field] = value;
    }

    const result = await getDataTable(req, exam_scheme, ['$examNameInfo.exam_name$'], where, schemeInclude);
    res.json(result);
  }),

  getByExamNameId: asyncHandler(async (req, res) => {
    const examNameId = toNumberOrNull(req.params.examNameId);
    if (!examNameId) throw httpError(400, 'Valid exam name id is required');

    const examNameRow = await exam_name.findByPk(examNameId, { attributes: ['id', 'exam_name'] });
    if (!examNameRow) throw httpError(404, 'Exam name not found');

    const data = await exam_scheme.findAll({
      where: { exam_name_id: examNameId },
      include: schemeInclude,
      order: [['class_id', 'ASC'], ['term_id', 'ASC'], ['id', 'ASC']],
    });
    res.json({ success: true, examName: examNameRow, count: data.length, data });
  }),

  getExamSchemeByExamNameClassTerm: asyncHandler(async (req, res) => {
    const where = {
      exam_name_id: toNumberOrNull(req.params.examNameId),
      class_id: toNumberOrNull(req.params.classId),
      term_id: toNumberOrNull(req.params.termId),
    };
    if (!where.exam_name_id) throw httpError(400, 'Valid exam name id is required');
    if (!where.class_id) throw httpError(400, 'Valid class id is required');
    if (!where.term_id) throw httpError(400, 'Valid term id is required');

    for (const field of ['program_id', 'semester_id']) {
      const value = toNumberOrNull(getQueryValue(req.query, field));
      if (value) where[field] = value;
    }

    const data = await exam_scheme.findOne({
      where,
      include: schemeInclude,
      order: [['id', 'ASC']],
    });
    if (!data) throw httpError(404, 'No exam scheme found for this exam name, class and term');

    res.json({ success: true, data });
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await findScheme(req.params.id);
    if (!data) throw httpError(404, 'Exam scheme not found');
    res.json({ success: true, data });
  }),

  getSubjectsComponentsBySchemeClassTerm: asyncHandler(async (req, res) => {
    const schemeId = toNumberOrNull(req.params.id);
    const classId = toNumberOrNull(req.params.classId);
    const termId = toNumberOrNull(req.params.termId);
    if (!schemeId) throw httpError(400, 'Valid exam scheme id is required');
    if (!classId) throw httpError(400, 'Valid class id is required');
    if (!termId) throw httpError(400, 'Valid term id is required');

    const scheme = await exam_scheme.findOne({
      where: { id: schemeId, class_id: classId, term_id: termId },
      include: schemeInclude,
    });
    if (!scheme) throw httpError(404, 'Exam scheme not found for this scheme, class and term');

    const assessments = await exam_assessment.findAll({
      where: { exam_scheme_id: schemeId },
      include: [
        { model: Subject, as: 'subjectInfo', attributes: ['id', 'value', 'abbreviation_name'] },
        { model: component, as: 'componentInfo', attributes: ['id', 'component_name', 'type'] },
        {
          model: assessment_component,
          as: 'components',
          include: [{ model: component, as: 'componentInfo', attributes: ['id', 'component_name', 'type'] }],
        },
      ],
      order: [
        ['subject_id', 'ASC'],
        ['sequence', 'ASC'],
        ['id', 'ASC'],
        [{ model: assessment_component, as: 'components' }, 'sequence', 'ASC'],
      ],
    });

    const data = assessments.map((row) => ({
      scheme_id: scheme.id,
      exam_name: scheme.examNameInfo?.exam_name ?? null,
      component: row.componentInfo?.component_name ?? null,
      subject: row.subjectInfo?.value ?? null,
      class: scheme.classInfo?.class_name ?? null,
      term: scheme.termInfo?.term_name ?? null,
      assessment_id: row.id,
      subject_id: row.subject_id,
      component_id: row.component_id,
      class_id: scheme.class_id,
      term_id: scheme.term_id,
      subcomponents: row.components.map((item) => ({
        id: item.id,
        component_id: item.component_id,
        component_name: item.componentInfo?.component_name ?? null,
        type: item.componentInfo?.type ?? null,
        max_marks: Number(item.max_marks),
        sequence: item.sequence,
      })),
    }));

    res.json({
      success: true,
      count: data.length,
      data,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const record = await exam_scheme.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Exam scheme not found');

    const scheme = readScheme(req.body);
    await validate(scheme, record.id);

    await record.update(scheme);
    res.json({ success: true, message: 'Exam scheme updated', data: await findScheme(record.id) });
  }),

  delete: asyncHandler(async (req, res) => {
    const record = await exam_scheme.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Exam scheme not found');

    await record.destroy();
    res.json({ success: true, message: 'Exam scheme deleted' });
  }),
};

module.exports = examSchemeController;
