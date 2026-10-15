const asyncHandler = require('express-async-handler');
const { grade_scale, grade_scale_range, sequelize } = require('../../models');
const {
  httpError,
  toNumberOrNull,
  toBoolean,
  getQueryValue,
  syncChildren,
} = require('./examHelper');
const { getDataTable } = require('../../helper');

const SCALE_TYPES = ['marks', 'descriptor'];

const rangeInclude = {
  model: grade_scale_range,
  as: 'ranges',
};
const rangeOrder = [
  [{ model: grade_scale_range, as: 'ranges' }, 'sequence', 'ASC'],
  [{ model: grade_scale_range, as: 'ranges' }, 'id', 'ASC'],
];

function readScale(body) {
  return {
    name: String(body.name ?? '').trim(),
    type: body.type || 'marks',
    is_active: toBoolean(body.is_active, true),
  };
}

function readRanges(body, type) {
  const rows = Array.isArray(body.ranges) ? body.ranges : [];
  return rows.map((row, index) => ({
    id: row.id,
    grade: String(row.grade ?? '').trim(),
    description: row.description ? String(row.description).trim() : null,
    min_percent: type === 'marks' ? toNumberOrNull(row.min_percent) : null,
    max_percent: type === 'marks' ? toNumberOrNull(row.max_percent) : null,
    grade_point: toNumberOrNull(row.grade_point),
    is_fail: toBoolean(row.is_fail, false),
    sequence: toNumberOrNull(row.sequence) ?? index + 1,
  }));
}

function validate(scale, ranges) {
  if (!scale.name) throw httpError(400, 'Scale name is required');
  if (!SCALE_TYPES.includes(scale.type)) throw httpError(400, 'Type must be marks or descriptor');
  if (!ranges.length) throw httpError(400, 'At least one grade row is required');

  const grades = new Set();
  for (const range of ranges) {
    if (!range.grade) throw httpError(400, 'Every row needs a grade');
    const key = range.grade.toLowerCase();
    if (grades.has(key)) throw httpError(400, `Grade "${range.grade}" is repeated`);
    grades.add(key);
  }

  if (scale.type !== 'marks') return;

  for (const range of ranges) {
    const { grade, min_percent: min, max_percent: max } = range;
    if (min === null || max === null) throw httpError(400, `Min % and Max % are required for grade ${grade}`);
    if (min < 0 || max > 100 || min > max) {
      throw httpError(400, `Grade ${grade}: Min % and Max % must be between 0 and 100 and Min % <= Max %`);
    }
  }

  const sorted = [...ranges].sort((a, b) => a.min_percent - b.min_percent);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].min_percent <= sorted[i - 1].max_percent) {
      throw httpError(400, `Grades ${sorted[i - 1].grade} and ${sorted[i].grade} have overlapping ranges`);
    }
  }
}

async function findScale(id) {
  return grade_scale.findByPk(id, { include: [rangeInclude], order: rangeOrder });
}

const gradeScaleController = {
  create: asyncHandler(async (req, res) => {
    const scale = readScale(req.body);
    const ranges = readRanges(req.body, scale.type);
    validate(scale, ranges);

    const id = await sequelize.transaction(async (transaction) => {
      const created = await grade_scale.create(scale, { transaction });
      await grade_scale_range.bulkCreate(
        ranges.map(({ id: _id, ...range }) => ({ ...range, grade_scale_id: created.id })),
        { transaction }
      );
      return created.id;
    });

    res.status(201).json({ success: true, message: 'Grade scale created', data: await findScale(id) });
  }),

  getAll: asyncHandler(async (req, res) => {
    const where = {};
    const type = getQueryValue(req.query, 'type');
    const isActive = getQueryValue(req.query, 'is_active');
    if (type) where.type = type;
    if (isActive !== '') where.is_active = toBoolean(isActive);

    const result = await getDataTable(req, grade_scale, ['name', 'type'], where, [
      { ...rangeInclude, separate: true, order: [['sequence', 'ASC'], ['id', 'ASC']] },
    ]);
    res.json(result);
  }),

  getById: asyncHandler(async (req, res) => {
    const data = await findScale(req.params.id);
    if (!data) throw httpError(404, 'Grade scale not found');
    res.json({ success: true, data });
  }),

  update: asyncHandler(async (req, res) => {
    const record = await grade_scale.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Grade scale not found');

    const scale = readScale(req.body);
    const ranges = readRanges(req.body, scale.type);
    validate(scale, ranges);

    await sequelize.transaction(async (transaction) => {
      await record.update(scale, { transaction });
      await syncChildren({
        model: grade_scale_range,
        where: { grade_scale_id: record.id },
        rows: ranges,
        build: ({ id: _id, ...range }) => range,
        transaction,
      });
    });

    res.json({ success: true, message: 'Grade scale updated', data: await findScale(record.id) });
  }),

  delete: asyncHandler(async (req, res) => {
    const record = await grade_scale.findByPk(req.params.id);
    if (!record) throw httpError(404, 'Grade scale not found');

    await record.destroy();
    res.json({ success: true, message: 'Grade scale deleted' });
  }),
};

module.exports = gradeScaleController;
