const asyncHandler = require('express-async-handler');
const { QueryTypes, Op } = require('sequelize');
const {
  preodictestmarkentry,
  preodictest,
  par_student_personal_information,
  sequelize,
} = require('../../models');
const filterStudentPreodictest = require('../../utils/filterstudentPreodictest');

const BATCH_SIZE = 500;

function mapEntryBody(body) {
  const preodictest_id =
    body.preodictest_id ??
    body.preodictestId ??
    body.preodictableid ??
    body.preodictableId;
  const reg_no = body.reg_no ?? body.regno ?? body.regNo;
  const mark_obtained =
    body.mark_obtained ?? body.markObtained ?? body.markobtained;
  const date = body.date;

  return { preodictest_id, reg_no, mark_obtained, date };
}

function getRowsFromBody(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && Array.isArray(body.entries)) return body.entries;
  return null;
}

async function assertPreodictestExists(preodictest_id) {
  const test = await preodictest.findByPk(preodictest_id);
  if (!test) {
    const err = new Error('Periodic test not found');
    err.statusCode = 404;
    throw err;
  }
  return test;
}

const preodictestmarkentryController = {
  create: asyncHandler(async (req, res) => {
    const { preodictest_id, reg_no, mark_obtained, date } = mapEntryBody(req.body);

    if (
      !preodictest_id ||
      reg_no === undefined ||
      reg_no === null ||
      reg_no === '' ||
      mark_obtained === undefined ||
      mark_obtained === null ||
      mark_obtained === '' ||
      !date
    ) {
      return res.status(400).json({
        success: false,
        message:
          'preodictest_id, reg_no, mark_obtained, and date are required',
      });
    }

    await assertPreodictestExists(preodictest_id);

    await preodictestmarkentry.bulkCreate(
      [
        {
          preodictest_id,
          reg_no,
          mark_obtained,
          date,
        },
      ],
      {
        updateOnDuplicate: ['mark_obtained', 'date', 'updatedAt'],
      }
    );

    const record = await preodictestmarkentry.findOne({
      where: { preodictest_id, reg_no },
    });

    return res.status(201).json({
      success: true,
      message: 'Periodic test mark entry saved',
      data: record,
    });
  }),

  bulkCreate: asyncHandler(async (req, res) => {
    const rows = getRowsFromBody(req.body);
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'Request body must be a non-empty array (or { rows: [...] } / { data: [...] } / { entries: [...] })',
      });
    }

    const payload = rows.map((row) => {
      const mapped = mapEntryBody(row);
      return {
        ...mapped,
        date: mapped.date || null,
      };
    });
    const invalid = payload.find(
      (r) =>
        !r.preodictest_id ||
        r.reg_no === undefined ||
        r.reg_no === null ||
        r.reg_no === '' ||
        r.mark_obtained === undefined ||
        r.mark_obtained === null ||
        r.mark_obtained === ''
    );
    if (invalid) {
      return res.status(400).json({
        success: false,
        message:
          'Each row requires preodictest_id, reg_no, and mark_obtained',
      });
    }

    const testIds = [...new Set(payload.map((r) => r.preodictest_id))];
    const tests = await preodictest.findAll({
      where: { id: { [Op.in]: testIds } },
      attributes: ['id'],
    });
    if (tests.length !== testIds.length) {
      return res.status(404).json({
        success: false,
        message: 'One or more periodic tests not found',
      });
    }

    const conditions = payload.map((r) => ({
      preodictest_id: r.preodictest_id,
      reg_no: r.reg_no,
    }));

    const existing = await preodictestmarkentry.findAll({
      where: { [Op.or]: conditions },
    });
    const existingMap = new Map(
      existing.map((r) => [`${r.preodictest_id}:${r.reg_no}`, r])
    );

    const toCreate = [];
    const toUpdate = [];
    for (const row of payload) {
      const key = `${row.preodictest_id}:${row.reg_no}`;
      const found = existingMap.get(key);
      if (found) {
        toUpdate.push({ id: found.id, ...row });
      } else {
        toCreate.push(row);
      }
    }

    if (toCreate.length) {
      for (let i = 0; i < toCreate.length; i += BATCH_SIZE) {
        const chunk = toCreate.slice(i, i + BATCH_SIZE);
        await preodictestmarkentry.bulkCreate(chunk, { validate: true });
      }
    }

    if (toUpdate.length) {
      for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
        const chunk = toUpdate.slice(i, i + BATCH_SIZE);
        await Promise.all(
          chunk.map((row) =>
            preodictestmarkentry.update(
              {
                mark_obtained: row.mark_obtained,
                date: row.date,
              },
              { where: { id: row.id } }
            )
          )
        );
      }
    }

    const data = await preodictestmarkentry.findAll({
      where: { [Op.or]: conditions },
      order: [
        ['preodictest_id', 'ASC'],
        ['reg_no', 'ASC'],
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Periodic test mark entries saved',
      count: data.length,
      data,
    });
  }),

  getByTestId: asyncHandler(async (req, res) => {
    const preodictest_id =
      req.params.preodictest_id ??
      req.params.preodictestId ??
      req.params.id;

    await assertPreodictestExists(preodictest_id);

    const query = `SELECT
      me.id,
      me.preodictest_id,
      me.reg_no,
      me.mark_obtained,
      me.date,
      me.createdAt,
      me.updatedAt,
      st.first_name,
      st.last_name,
      st.father_name,
      st.rollnumber
    FROM preodictestmarkentries AS me
    LEFT JOIN par_student_personal_informations AS st ON me.reg_no = st.reg_no
    WHERE me.preodictest_id = :preodictest_id
    ORDER BY st.rollnumber ASC`;

    const records = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { preodictest_id },
    });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  }),

  getByRegNo: asyncHandler(async (req, res) => {
    const reg_no = req.params.reg_no ?? req.params.regNo ?? req.query.reg_no;

    if (reg_no === undefined || reg_no === null || reg_no === '') {
      return res.status(400).json({
        success: false,
        message: 'reg_no is required',
      });
    }

    const query = `SELECT
      me.id,
      me.preodictest_id,
      me.reg_no,
      me.mark_obtained,
      me.date,
      me.createdAt,
      me.updatedAt,
      pt.exam_name,
      pt.total_marks,
      pt.date AS test_date,
      pt.topics,
      cm.class_name,
      dv.division_name,
      sb.value AS subject_name
    FROM preodictestmarkentries AS me
    JOIN preodictests AS pt ON me.preodictest_id = pt.id
    LEFT JOIN class_masters AS cm ON pt.class = cm.id
    LEFT JOIN division_masters AS dv ON pt.division = dv.id
    LEFT JOIN Subjects AS sb ON pt.subject = sb.id
    WHERE me.reg_no = :reg_no
    ORDER BY me.date DESC, me.id DESC`;

    const records = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      replacements: { reg_no },
    });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  }),

  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await preodictestmarkentry.findByPk(id, {
      include: [
        {
          model: preodictest,
          as: 'preodictestInfo',
        },
        {
          model: par_student_personal_information,
          as: 'student',
          attributes: ['reg_no', 'first_name', 'last_name', 'class', 'division'],
        },
      ],
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Mark entry not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  }),

  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await preodictestmarkentry.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Mark entry not found',
      });
    }

    const mapped = mapEntryBody(req.body);
    const updates = {};

    if (mapped.preodictest_id !== undefined && mapped.preodictest_id !== null) {
      await assertPreodictestExists(mapped.preodictest_id);
      updates.preodictest_id = mapped.preodictest_id;
    }
    if (mapped.reg_no !== undefined && mapped.reg_no !== null && mapped.reg_no !== '') {
      updates.reg_no = mapped.reg_no;
    }
    if (
      mapped.mark_obtained !== undefined &&
      mapped.mark_obtained !== null &&
      mapped.mark_obtained !== ''
    ) {
      updates.mark_obtained = mapped.mark_obtained;
    }
    if (mapped.date) {
      updates.date = mapped.date;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update',
      });
    }

    await record.update(updates);

    return res.status(200).json({
      success: true,
      message: 'Mark entry updated',
      data: record,
    });
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const record = await preodictestmarkentry.findByPk(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Mark entry not found',
      });
    }

    await record.destroy();

    return res.status(200).json({
      success: true,
      message: 'Mark entry deleted',
    });
  }),
  filterStudentPreodictest:asyncHandler(async(req,res)=>{
    const { classId, divisionId, subjectId } = req.query;
    const students = await filterStudentPreodictest({class:classId,division:divisionId,subject:subjectId});
    return res.status(200).json({
      success: true,
      data: students,
    });
  }),
};

module.exports = preodictestmarkentryController;
