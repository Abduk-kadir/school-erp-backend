const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

// Formula cell -> cached result; plain cell -> value
const readNumber = (cell) => {
  let v = cell?.value;
  if (v && typeof v === "object" && "result" in v) v = v.result;
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

/**
 * Build student_head_result rows (one per student per head) from the marks sheet.
 *
 * @param {object} p
 * @param {object} p.sheet        - ExcelJS "Marks" worksheet
 * @param {object} p.layout       - JSON.parse(metaValues.layout)
 * @param {Array}  p.studentRows  - JSON.parse(metaValues.students) -> [{ row, student_id }]
 * @param {number} p.examSchemeId
 * @param {number} p.subjectId
 */
const buildStudentHeadResults = ({ sheet, layout, studentRows, examSchemeId, subjectId }) => {
  // Head details do not depend on the student, so prepare them once
  const heads = layout.groups.flatMap((group) =>
    group.heads.map((head) => ({
      assessmentId: head.assessment_id,
      ratio: Number(head.ratio) || 1,
      totalCol: head.total_col,
      convertedCol: head.converted_col,
      markCols: head.marks.map((m) => m.col),
      maxMarks: round2(head.marks.reduce((s, m) => s + Number(m.max_marks || 0), 0)),
    }))
  );

  return studentRows.flatMap(({ row: rowNo, student_id }) =>
    heads.map((head) => {
      const obtained =
        readNumber(sheet.getCell(rowNo, head.totalCol)) ??
        round2(head.markCols.reduce((s, col) => s + (readNumber(sheet.getCell(rowNo, col)) || 0), 0));

      const converted =
        readNumber(sheet.getCell(rowNo, head.convertedCol)) ?? round2(obtained * head.ratio);

      return {
        exam_scheme_id: examSchemeId,
        student_id,
        subject_id: subjectId,
        exam_assessment_id: head.assessmentId,
        obtained,
        max_marks: head.maxMarks,
        converted,
        grade: null,
        is_pass: null,
        is_absent: false,
      };
    })
  );
};

module.exports = { buildStudentHeadResults };