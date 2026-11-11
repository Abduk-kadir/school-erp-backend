const { readNumber } = require("./buildStudentHead");

// assessment_groups name -> "formative" | "summative" | null
const groupKind = (name) => {
  const n = String(name || "").trim().toLowerCase();
  if (n === "formative") return "formative";
  if (n === "summative" || n === "submative") return "summative";
  return null;
};

// One row per student. A group total comes from the sheet; if Excel never
// calculated it, the head converted marks from headResults are added up.
const buildStudentSubjectResults = ({ sheet, layout, studentRows, headResults, groupNameById, examSchemeId, subjectId }) => {
  const groups = layout.groups.map((g) => ({
    kind: groupKind(groupNameById.get(g.group_id)),
    totalCol: g.total_col,
    headIds: g.heads.map((h) => h.assessment_id),
  }));
  const formativeGroups = groups.filter((g) => g.kind === "formative");
  const summativeGroups = groups.filter((g) => g.kind === "summative");

  const convertedByKey = new Map(
    headResults.map((h) => [`${h.student_id}|${h.exam_assessment_id}`, h.converted])
  );

  return studentRows.map(({ row, student_id }) => {
    const groupTotal = (g) =>
      readNumber(sheet.getCell(row, g.totalCol)) ??
      g.headIds.reduce((s, id) => s + (convertedByKey.get(`${student_id}|${id}`) || 0), 0);
    const sumGroups = (list) => (list.length ? list.reduce((s, g) => s + groupTotal(g), 0) : null);

    const formative = sumGroups(formativeGroups);
    const summative = sumGroups(summativeGroups);

    return {
      exam_scheme_id: examSchemeId,
      student_id,
      subject_id: subjectId,
      formative_obtained: formative,
      summative_obtained: summative,
      total_obtained: readNumber(sheet.getCell(row, layout.grand_col)) ?? (formative || 0) + (summative || 0),
    };
  });
};

module.exports = { buildStudentSubjectResults };
