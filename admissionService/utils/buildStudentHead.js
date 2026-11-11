// Formula cell -> cached result; plain cell -> value
const readNumber = (cell) => {
  let v = cell?.value;
  if (v && typeof v === "object" && "result" in v) v = v.result;
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// One row per student per head. Values come from the sheet's formula cells;
// if Excel never calculated them, they are worked out from the mark cells.
const buildStudentHeadResults = ({ sheet, layout, studentRows, examSchemeId, subjectId }) => {
  const heads = layout.groups.flatMap((g) => g.heads);

  return studentRows.flatMap(({ row, student_id }) =>
    heads.map((head) => {
      const obtained =
        readNumber(sheet.getCell(row, head.total_col)) ??
        head.marks.reduce((s, m) => s + (readNumber(sheet.getCell(row, m.col)) || 0), 0);
      const converted =
        readNumber(sheet.getCell(row, head.converted_col)) ?? obtained * (Number(head.ratio) || 1);

      return {
        exam_scheme_id: examSchemeId,
        student_id,
        subject_id: subjectId,
        exam_assessment_id: head.assessment_id,
        obtained,
        converted,
      };
    })
  );
};

module.exports = { readNumber, buildStudentHeadResults };
