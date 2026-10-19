const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const {
  exam_configure,
  exam_scheme,
  grade_scale,
  exam_name,
  class_master,
  term,
  Subject,
} = require('../../models');
const { httpError, toNumberOrNull, toBoolean, getQueryValue } = require('./examHelper');
const { getDataTable } = require('../../helper');

const configureInclude = [
  {
    model: exam_scheme,
    as: 'exam',
    attributes: ['id', 'exam_name_id', 'class_id', 'term_id'],
    include: [{ model: exam_name, as: 'examNameInfo', attributes: ['id', 'exam_name'] }],
  },
  { model: class_master, as: 'classInfo', attributes: ['id', 'class_name'] },
  { model: term, as: 'termInfo', attributes: ['id', 'term_name'] },
  { model: Subject, as: 'subjectInfo', attributes: ['id', 'value', 'abbreviation_name'] },
  { model: grade_scale, as: 'gradeScale', attributes: ['id', 'name', 'type'] },
];

function readConfigure(body) {
  return {
    exam_id: toNumberOrNull(body.exam_id ?? body.examid),
    class_id: toNumberOrNull(body.class_id ?? body.classid),
    term_id: toNumberOrNull(body.term_id ?? body.termid),
    subject_id: toNumberOrNull(body.subject_id ?? body.subjectid),
    grade_scale_id: toNumberOrNull(body.grade_scale_id ?? body.gradescaleid),
    is_separate_passing: toBoolean(body.is_separate_passing ?? body.issepratepassing, false),
    is_included_in_total: toBoolean(body.is_included_in_total ?? body.isincluded_in_total, true),
    mark_or_grade: toBoolean(body.mark_or_grade ?? body.markorgrade, true),
    formative_total: toNumberOrNull(body.formative_total),
    formative_passing: toNumberOrNull(body.formative_passing),
    formative_ratio: toNumberOrNull(body.formative_ratio ?? body.formative_radio),
    summative_total: toNumberOrNull(body.summative_total ?? body.submative_total),
    summative_passing: toNumberOrNull(body.summative_passing ?? body.submative_passing),
    summative_ratio: toNumberOrNull(body.summative_ratio ?? body.submative_ratio),
    total_mark: toNumberOrNull(body.total_mark),
    total_passing: toNumberOrNull(body.total_passing),
  };
}

async function validate(config, excludeId) {
  if (!config.exam_id) throw httpError(400, 'Exam is required');
  if (!config.class_id) throw httpError(400, 'Class is required');
  if (!config.term_id) throw httpError(400, 'Term is required');
  if (!config.subject_id) throw httpError(400, 'Subject is required');
  if (!config.grade_scale_id) throw httpError(400, 'Grade scale is required');

  const [examRow, classRow, termRow, subjectRow, gradeRow] = await Promise.all([
    exam_scheme.findByPk(config.exam_id),
    class_master.findByPk(config.class_id),
    term.findByPk(config.term_id),
    Subject.findByPk(config.subject_id),
    grade_scale.findByPk(config.grade_scale_id),
  ]);
  if (!examRow) throw httpError(400, 'Selected exam does not exist');
  if (!classRow) throw httpError(400, 'Selected class does not exist');
  if (!termRow) throw httpError(400, 'Selected term does not exist');
  if (!subjectRow) throw httpError(400, 'Selected subject does not exist');
  if (!gradeRow) throw httpError(400, 'Selected grade scale does not exist');

  const where = {
    exam_id: config.exam_id,
    class_id: config.class_id,
    term_id: config.term_id,
    subject_id: config.subject_id,
  };
  if (excludeId) where.id = { [Op.ne]: excludeId };
  if (await exam_configure.findOne({ where })) {
    throw httpError(409, 'Exam configure already exists for this exam, class, term and subject');
  }
}

function findConfigure(id) {
  return exam_configure.findByPk(id, { include: configureInclude });
}

const examConfigureController = {
  create: asyncHandler(async (req, res) => {
    const config = readConfigure(req.body);
    await validate(config);

    const created = await exam_configure.create(config);
    res.status(201).json({
      success: true,
      message: 'Exam configure created',
      data: await findConfigure(created.id),
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const where = {};
    for (const field of ['exam_id', 'class_id', 'term_id', 'subject_id', 'grade_scale_id']) {
      const value = toNumberOrNull(getQueryValue(req.query, field));
      if (value) where[field] = value;
    }

    const result = await getDataTable(req, exam_configure, [], where, configureInclude);
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await findConfigure(req.params.id);
    if (!data) throw httpError(404, 'Exam configure not found');
    res.json({ success: true, data });
  }),

  getByExamId: asyncHandler(async (req, res) => {
    const examId = toNumberOrNull(req.params.examId);
    if (!examId) throw httpError(400, 'Valid exam id is required');

    const data = await exam_configure.findAll({
      where: { exam_id: examId },
      include: configureInclude,
      order: [['subject_id', 'ASC'], ['id', 'ASC']],
    });
    res.json({ success: true, count: data.length, data });
  }),

  update: asyncHandler(async (req, res) => {
    const record = await exam_configure.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Exam configure not found');

    const config = readConfigure(req.body);
    await validate(config, record.id);

    await record.update(config);
    res.json({
      success: true,
      message: 'Exam configure updated',
      data: await findConfigure(record.id),
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const record = await exam_configure.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Exam configure not found');

    await record.destroy();
    res.json({ success: true, message: 'Exam configure deleted' });
  }),
};

module.exports = examConfigureController;
