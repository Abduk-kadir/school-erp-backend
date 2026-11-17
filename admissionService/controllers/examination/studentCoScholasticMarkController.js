const asyncHandler = require('express-async-handler');
const {
  student_co_scholastic_mark,
  result_mark_entry_list,
  par_student_personal_information,
  exam_scheme,
  exam_name,
  class_master,
  term,
  division_master,
  Subject,
  sequelize,
} = require('../../models');
const { httpError, toNumberOrNull, getQueryValue } = require('./examHelper');
const { getDataTable } = require('../../helper');
const ExcelJS = require('exceljs');

const entryListInclude = {
  model: result_mark_entry_list,
  as: 'entryList',
  attributes: ['id', 'exam_scheme_id', 'division_id', 'subject_id', 'searchbystudent'],
  include: [
    {
      model: exam_scheme,
      as: 'scheme',
      attributes: ['id', 'exam_name_id', 'class_id', 'term_id'],
      include: [
        { model: exam_name, as: 'examNameInfo', attributes: ['id', 'exam_name'] },
        { model: class_master, as: 'classInfo', attributes: ['id', 'class_name'] },
        { model: term, as: 'termInfo', attributes: ['id', 'term_name'] },
      ],
    },
    { model: division_master, as: 'divisionInfo', attributes: ['id', 'division_name'] },
    { model: Subject, as: 'subjectInfo', attributes: ['id', 'value', 'abbreviation_name'] },
  ],
};

const studentInclude = {
  model: par_student_personal_information,
  as: 'student',
  attributes: ['id', 'reg_no', 'rollnumber', 'first_name', 'last_name', 'father_name'],
};

const cellValue = (cell) => {
  const value = cell?.value;
  if (value && typeof value === 'object' && 'result' in value) return value.result;
  return value ?? null;
};

// Updates existing rows in one UPDATE ... JOIN per 500 rows instead of one query per row.
const bulkUpdate = async (table, keyCols, valueCols, rows, transaction) => {
  const cols = [...keyCols, ...valueCols];
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const replacements = [];
    const selects = chunk.map((row, index) => {
      cols.forEach((c) => replacements.push(row[c] ?? null));
      return 'SELECT ' + cols.map((c) => (index === 0 ? `? AS \`${c}\`` : '?')).join(', ');
    });
    const sql = `UPDATE \`${table}\` t
      JOIN (${selects.join(' UNION ALL ')}) v
        ON ${keyCols.map((c) => `t.\`${c}\` <=> v.\`${c}\``).join(' AND ')}
      SET ${valueCols.map((c) => `t.\`${c}\` = v.\`${c}\``).join(', ')}, t.updatedAt = NOW()`;
    await sequelize.query(sql, { replacements, transaction });
  }
};

const studentCoScholasticMarkController = {
  create: asyncHandler(async (req, res) => {
    const exam_scheme_id = toNumberOrNull(req.body.exam_scheme_id);
    const class_id = toNumberOrNull(req.body.class_id);
    const division_id = toNumberOrNull(req.body.division_id);
    const subject_id = toNumberOrNull(req.body.subject_id);
    const sort_by = req.body.sort_by ?? null;
    if (!exam_scheme_id || !class_id || !division_id || !subject_id) {
      throw httpError(400, 'exam_scheme_id, class_id, division_id and subject_id are required');
    }

    // ---------- STEP 1: students of the class and division ----------
    const students = await par_student_personal_information.findAll({
      where: { class: class_id, division: division_id },
      attributes: ['reg_no'],
      raw: true,
    });

    // ---------- STEP 2: save in one transaction (any failure rolls back all of it) ----------
    const entryWhere = { exam_scheme_id, division_id, subject_id };
    const { entryId, isNewEntry } = await sequelize.transaction(async (transaction) => {
      // Entry list: create it, or only update sort_by when it already exists
      let entry = await result_mark_entry_list.findOne({ where: entryWhere, transaction });
      const isNewEntry = !entry;
      if (entry) {
        await entry.update({ searchbystudent: sort_by }, { transaction });
      } else {
        entry = await result_mark_entry_list.create({ ...entryWhere, searchbystudent: sort_by }, { transaction });
      }

      // ===== SAVE: student_co_scholastic_marks =====
      // One row per student with grade null; for an existing entry only students without a row are added,
      // so grades already entered are never overwritten
      const existing = isNewEntry
        ? []
        : await student_co_scholastic_mark.findAll({
          where: { result_mark_entry_list_id: entry.id },
          attributes: ['student_reg_no'],
          raw: true,
          transaction,
        });
      const existingRegNos = new Set(existing.map((row) => row.student_reg_no));
      const newRows = students
        .filter((student) => !existingRegNos.has(student.reg_no))
        .map((student) => ({ result_mark_entry_list_id: entry.id, student_reg_no: student.reg_no, grade: null }));

      for (let i = 0; i < newRows.length; i += 1000) {
        await student_co_scholastic_mark.bulkCreate(newRows.slice(i, i + 1000), { transaction });
      }

      return { entryId: entry.id, isNewEntry };
    });

    // ---------- STEP 3: response ----------
    const data = await student_co_scholastic_mark.findAll({
      where: { result_mark_entry_list_id: entryId },
      include: [studentInclude],
      order: [['student_reg_no', 'ASC']],
    });
    res.status(isNewEntry ? 201 : 200).json({
      success: true,
      message: isNewEntry ? 'Co-scholastic mark entry created successfully' : 'Co-scholastic mark entry updated successfully',
      result_mark_entry_list_id: entryId,
      count: data.length,
      data,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const filters = {
      result_mark_entry_list_id: ['result_mark_entry_list_id', 'resultMarkEntryListId'],
      student_reg_no: ['student_reg_no', 'studentRegNo'],
      '$entryList.exam_scheme_id$': ['exam_scheme_id', 'examSchemeId'],
      '$entryList.division_id$': ['division_id', 'divisionId'],
      '$entryList.subject_id$': ['subject_id', 'subjectId'],
    };

    const where = {};
    for (const [field, names] of Object.entries(filters)) {
      for (const name of names) {
        const value = toNumberOrNull(getQueryValue(req.query, name));
        if (value) {
          where[field] = value;
          break;
        }
      }
    }

    const result = await getDataTable(req, student_co_scholastic_mark, ['grade'], where, [entryListInclude, studentInclude]);
    res.json(result);
  }),

  importCoScholasticMarks: asyncHandler(async (req, res) => {
    if (!req.file?.buffer) throw httpError(400, 'Excel file is required');

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.getWorksheet('Marks');
    const meta = workbook.getWorksheet('Meta');
    if (!sheet || !meta) throw httpError(400, 'Invalid file: Marks / Meta sheet missing');

    const metaValues = {};
    meta.eachRow((row) => {
      const key = String(row.getCell(1).text || '').trim();
      const value = row.getCell(2).text;
      if (key) metaValues[key] = value;
    });
    if (metaValues.sheet_type !== 'co_scholastic') {
      throw httpError(400, 'Not a co-scholastic template');
    }

    const resultMarkEntryListId = toNumberOrNull(metaValues.result_mark_entry_id);
    if (!resultMarkEntryListId) throw httpError(400, 'result_mark_entry_id is required in Meta sheet');

    const rows = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 3) return;
      const studentRegNo = toNumberOrNull(cellValue(row.getCell(2)));
      if (!studentRegNo) return;

      const rawGrade = cellValue(row.getCell(6));
      const grade =
        rawGrade === null || rawGrade === undefined || String(rawGrade).trim() === ''
          ? null
          : String(rawGrade).trim();

      rows.push({
        result_mark_entry_list_id: resultMarkEntryListId,
        student_reg_no: studentRegNo,
        grade,
      });
    });

    if (!rows.length) throw httpError(400, 'No student grade rows found in Marks sheet');

    await sequelize.transaction(async (transaction) => {
      await bulkUpdate(
        'student_co_scholastic_marks',
        ['result_mark_entry_list_id', 'student_reg_no'],
        ['grade'],
        rows,
        transaction
      );
    });

    res.json({
      success: true,
      message: 'Co-scholastic marks imported successfully',
      result_mark_entry_list_id: resultMarkEntryListId,
      updated: rows.length,
    });
  }),
};

module.exports = studentCoScholasticMarkController;
