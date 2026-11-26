const asyncHandler = require('express-async-handler');
const {
  assign_descriptive_remark,
  exam_scheme,
  descriptive_remark,
  par_student_personal_information,
  sequelize,
} = require('../../models');
const { httpError, toNumberOrNull, getQueryValue } = require('./examHelper');

const include = [
  {
    model: exam_scheme,
    as: 'scheme',
    attributes: ['id', 'exam_name_id', 'class_id', 'term_id'],
  },
  {
    model: descriptive_remark,
    as: 'remarkInfo',
    attributes: ['id', 'remark'],
  },
  {
    model: par_student_personal_information,
    as: 'student',
    attributes: ['id', 'reg_no', 'rollnumber', 'first_name', 'last_name', 'father_name'],
  },
];

const assignDescriptiveRemarkController = {
  create: asyncHandler(async (req, res) => {
    const sharedSchemeId = toNumberOrNull(req.body.exam_scheme_id);
    const sharedRegNo = toNumberOrNull(req.body.reg_no);
    const rowsInput = Array.isArray(req.body)
      ? req.body
      : Array.isArray(req.body.assignments)
        ? req.body.assignments
        : Array.isArray(req.body.remarks)
          ? req.body.remarks
          : Array.isArray(req.body.data)
            ? req.body.data
            : null;

    if (!rowsInput || !rowsInput.length) {
      throw httpError(400, 'Send an array of assignments (assignments / remarks / data)');
    }

    const rows = rowsInput.map((row, index) => {
      const exam_scheme_id = toNumberOrNull(row.exam_scheme_id) ?? sharedSchemeId;
      const reg_no = toNumberOrNull(row.reg_no) ?? sharedRegNo;
      const remark_id = toNumberOrNull(row.remark_id);
      const sequence = toNumberOrNull(row.sequence) ?? index + 1;

      if (!exam_scheme_id || !reg_no || !remark_id) {
        throw httpError(400, `Row ${index + 1}: exam_scheme_id, reg_no and remark_id are required`);
      }
      return { exam_scheme_id, reg_no, remark_id, sequence };
    });

    const schemeIds = [...new Set(rows.map((r) => r.exam_scheme_id))];
    const regNos = [...new Set(rows.map((r) => r.reg_no))];
    const remarkIds = [...new Set(rows.map((r) => r.remark_id))];

    const [schemes, remarks, students] = await Promise.all([
      exam_scheme.findAll({ where: { id: schemeIds }, attributes: ['id'] }),
      descriptive_remark.findAll({ where: { id: remarkIds }, attributes: ['id'] }),
      par_student_personal_information.findAll({
        where: { reg_no: regNos },
        attributes: ['reg_no'],
      }),
    ]);

    const schemeSet = new Set(schemes.map((s) => s.id));
    const remarkSet = new Set(remarks.map((r) => r.id));
    const studentSet = new Set(students.map((s) => Number(s.reg_no)));

    for (const schemeId of schemeIds) {
      if (!schemeSet.has(schemeId)) throw httpError(404, `Exam scheme ${schemeId} not found`);
    }
    for (const remarkId of remarkIds) {
      if (!remarkSet.has(remarkId)) throw httpError(404, `Descriptive remark ${remarkId} not found`);
    }
    for (const regNo of regNos) {
      if (!studentSet.has(Number(regNo))) throw httpError(404, `Student not found for reg_no ${regNo}`);
    }

    const existing = await assign_descriptive_remark.findAll({
      where: {
        exam_scheme_id: schemeIds,
        reg_no: regNos,
        remark_id: remarkIds,
      },
      attributes: ['exam_scheme_id', 'reg_no', 'remark_id'],
      raw: true,
    });
    const existingKeys = new Set(
      existing.map((r) => `${r.exam_scheme_id}|${r.reg_no}|${r.remark_id}`)
    );

    const newRows = [];
    const seen = new Set();
    for (const row of rows) {
      const key = `${row.exam_scheme_id}|${row.reg_no}|${row.remark_id}`;
      if (existingKeys.has(key) || seen.has(key)) continue;
      seen.add(key);
      newRows.push(row);
    }

    if (!newRows.length) {
      throw httpError(409, 'All remarks are already assigned for the given students');
    }

    const created = await assign_descriptive_remark.bulkCreate(newRows);
    const data = await assign_descriptive_remark.findAll({
      where: { id: created.map((r) => r.id) },
      include,
      order: [['sequence', 'ASC'], ['id', 'ASC']],
    });

    res.status(201).json({
      success: true,
      message: 'Descriptive remarks assigned',
      count: data.length,
      data,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const exam_scheme_id = toNumberOrNull(getQueryValue(req.query, 'exam_scheme_id') || getQueryValue(req.query, 'examSchemeId'));
    const class_id = toNumberOrNull(getQueryValue(req.query, 'class_id') || getQueryValue(req.query, 'classId'));
    const term_id = toNumberOrNull(getQueryValue(req.query, 'term_id') || getQueryValue(req.query, 'termId'));
    const division_id = toNumberOrNull(getQueryValue(req.query, 'division_id') || getQueryValue(req.query, 'divisionId'));

    if (!exam_scheme_id || !class_id || !term_id || !division_id) {
      throw httpError(400, 'exam_scheme_id, class_id, term_id and division_id are required');
    }

    const draw = parseInt(req.query.draw, 10) || 1;
    const start = Math.max(parseInt(req.query.start, 10) || 0, 0);
    const length = Math.max(parseInt(req.query.length, 10) || 10, 1);

    const countRows = await sequelize.query(
      `SELECT COUNT(*) AS total
       FROM par_student_personal_informations p
       WHERE p.class = :class_id AND p.division = :division_id`,
      {
        replacements: { class_id, division_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const recordsTotal = Number(countRows[0]?.total || 0);
    const recordsFiltered = recordsTotal;

    const students = await sequelize.query(
      `SELECT p.id, p.reg_no, p.rollnumber, p.first_name, p.last_name, p.father_name
       FROM par_student_personal_informations p
       WHERE p.class = :class_id AND p.division = :division_id
       ORDER BY p.rollnumber ASC, p.first_name ASC
       LIMIT :length OFFSET :start`,
      {
        replacements: { class_id, division_id, length, start },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    const data = students.map((student) => ({
      id: student.id,
      reg_no: student.reg_no,
      rollnumber: student.rollnumber,
      first_name: student.first_name,
      last_name: student.last_name,
      father_name: student.father_name,
      has_assigned: false,
      assigned_remarks: [],
    }));

    if (data.length) {
      const regNos = data.map((s) => s.reg_no);
      const assignmentRows = await sequelize.query(
        `SELECT adr.id AS assign_id, adr.reg_no, adr.exam_scheme_id, adr.remark_id, adr.sequence, dr.remark
         FROM assign_descriptive_remarks adr
         LEFT JOIN descriptive_remarks dr ON dr.id = adr.remark_id
         WHERE adr.exam_scheme_id = :exam_scheme_id
           AND adr.reg_no IN (:regNos)
         ORDER BY adr.sequence ASC, adr.id ASC`,
        {
          replacements: { exam_scheme_id, regNos },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      const byRegNo = new Map(data.map((s) => [String(s.reg_no), s]));
      for (const row of assignmentRows) {
        const student = byRegNo.get(String(row.reg_no));
        if (!student) continue;
        student.has_assigned = true;
        student.assigned_remarks.push({
          id: row.assign_id,
          exam_scheme_id: row.exam_scheme_id,
          remark_id: row.remark_id,
          sequence: row.sequence,
          remark: row.remark,
        });
      }
    }

    res.json({
      success: true,
      draw,
      recordsTotal,
      recordsFiltered,
      exam_scheme_id,
      class_id,
      term_id,
      division_id,
      data,
    });
  }),

  getOnneStudentForDescriptiveRemark: asyncHandler(async (req, res) => {
    const exam_scheme_id = toNumberOrNull(req.query.exam_scheme_id);
    const class_id = toNumberOrNull(req.query.class_id);
    const term_id = toNumberOrNull(req.query.term_id);
    const division_id = toNumberOrNull(req.query.division_id);

    if (!exam_scheme_id || !class_id || !term_id || !division_id) {
      throw httpError(400, 'exam_scheme_id, class_id, term_id and division_id are required');
    }

    const students = await par_student_personal_information.findAll({
      where: { class: class_id, division: division_id },
      attributes: ['id', 'reg_no', 'rollnumber', 'first_name', 'last_name', 'father_name'],
      order: [['rollnumber', 'ASC']],
    });

    if (!students.length) throw httpError(404, 'No student found for this exam Scheme');

    let assigndescriptiveremark = null;
    let selectedstudent = null;
    for (const student of students) {
      assigndescriptiveremark = await assign_descriptive_remark.findOne({
        where: { exam_scheme_id, reg_no: student.reg_no },
      });
      if (assigndescriptiveremark) continue;
      selectedstudent = student;
      break;
    }

    if (!selectedstudent) throw httpError(404, 'all student have assigned descriptive remark');

    res.json({
      success: true,
      message: 'Student found for descriptive remark',
      data: {
        student: selectedstudent,
        
      },
    });
  }),

  update: asyncHandler(async (req, res) => {
    const rowsInput = Array.isArray(req.body.assigned_remarks) ? req.body.assigned_remarks : null;

    if (!rowsInput || !rowsInput.length) {
      throw httpError(400, 'assigned_remarks array is required');
    }

    const rows = rowsInput.map((row, index) => {
      const id = toNumberOrNull(row.id);
      const exam_scheme_id = toNumberOrNull(row.exam_scheme_id);
      const reg_no = toNumberOrNull(row.reg_no);
      const remark_id = toNumberOrNull(row.remark_id);
      const sequence = toNumberOrNull(row.sequence);

      if (!exam_scheme_id || !reg_no || !remark_id) {
        throw httpError(400, `Row ${index + 1}: exam_scheme_id, reg_no and remark_id are required`);
      }
      if (sequence === null) {
        throw httpError(400, `Row ${index + 1}: sequence is required`);
      }
      return { id, exam_scheme_id, reg_no, remark_id, sequence };
    });

    const schemeIds = [...new Set(rows.map((r) => r.exam_scheme_id))];
    const regNos = [...new Set(rows.map((r) => r.reg_no))];
    const remarkIds = [...new Set(rows.map((r) => r.remark_id))];

    const [schemes, remarks, students] = await Promise.all([
      exam_scheme.findAll({ where: { id: schemeIds }, attributes: ['id'] }),
      descriptive_remark.findAll({ where: { id: remarkIds }, attributes: ['id'] }),
      par_student_personal_information.findAll({
        where: { reg_no: regNos },
        attributes: ['reg_no'],
      }),
    ]);

    const schemeSet = new Set(schemes.map((s) => s.id));
    const remarkSet = new Set(remarks.map((r) => r.id));
    const studentSet = new Set(students.map((s) => Number(s.reg_no)));

    for (const schemeId of schemeIds) {
      if (!schemeSet.has(schemeId)) throw httpError(404, `Exam scheme ${schemeId} not found`);
    }
    for (const remarkId of remarkIds) {
      if (!remarkSet.has(remarkId)) throw httpError(404, `Descriptive remark ${remarkId} not found`);
    }
    for (const regNo of regNos) {
      if (!studentSet.has(Number(regNo))) throw httpError(404, `Student not found for reg_no ${regNo}`);
    }

    const updatedIds = [];

    await sequelize.transaction(async (transaction) => {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const existing = row.id
          ? await assign_descriptive_remark.findByPk(row.id, { transaction })
          : await assign_descriptive_remark.findOne({
              where: {
                exam_scheme_id: row.exam_scheme_id,
                reg_no: row.reg_no,
                remark_id: row.remark_id,
              },
              transaction,
            });

        if (!existing) {
          throw httpError(
            404,
            `Row ${i + 1}: assigned remark not found for exam_scheme_id=${row.exam_scheme_id}, reg_no=${row.reg_no}, remark_id=${row.remark_id}`
          );
        }

        await existing.update(
          {
            exam_scheme_id: row.exam_scheme_id,
            reg_no: row.reg_no,
            remark_id: row.remark_id,
            sequence: row.sequence,
          },
          { transaction }
        );
        updatedIds.push(existing.id);
      }
    });

    const data = await assign_descriptive_remark.findAll({
      where: { id: updatedIds },
      include,
      order: [['sequence', 'ASC'], ['id', 'ASC']],
    });

    res.json({
      success: true,
      message: 'Assigned descriptive remarks updated',
      count: data.length,
      data,
    });
  }),
};

module.exports = assignDescriptiveRemarkController;
