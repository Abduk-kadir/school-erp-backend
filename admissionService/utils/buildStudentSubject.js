// assessment_groups name -> "formative" | "summative" | null
const groupKind = (name) => {
  const n = String(name || "").trim().toLowerCase();
  if (n === "formative") return "formative";
  if (n === "summative" || n === "submative") return "summative";
  return null;
};

// Formula cell -> cached result; plain cell -> value
const readNumber = (cell) => {
  let v = cell?.value;
  if (v && typeof v === "object" && "result" in v) v = v.result;
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const headRatio = (head) => Number(head.ratio) || 1;

// Group max = sum of (head max marks x head ratio)
const groupMax = (group) =>
  group.heads.reduce((sum, head) => {
    const headMax = head.marks.reduce((s, m) => s + Number(m.max_marks || 0), 0);
    return sum + headMax * headRatio(head);
  }, 0);

// Student's group total from the sheet; if Excel never calculated it, add up the marks
const groupObtained = (sheet, rowNo, group) => {
  const fromSheet = readNumber(sheet.getCell(rowNo, group.total_col));
  if (fromSheet !== null) return fromSheet;

  return group.heads.reduce((sum, head) => {
    const headTotal = head.marks.reduce((s, m) => s + (readNumber(sheet.getCell(rowNo, m.col)) || 0), 0);
    return sum + headTotal * headRatio(head);
  }, 0);
};

// Sum of getValue(group) for every group of this kind; null when the subject has none
const sumGroups = (groups, kind, getValue) => {
  const list = groups.filter((g) => g.kind === kind);
  return list.length ? list.reduce((sum, g) => sum + getValue(g), 0) : null;
};

const buildStudentSubjectResults = ({ sheet, layout, studentRows, examSchemeId, subjectId, examConfigureId, groupNameById }) => {
  const groups = layout.groups
    .map((g) => ({ ...g, kind: groupKind(groupNameById.get(g.group_id)) }))
    .filter((g) => g.kind);
  console.log('groups ****',groups)

  const formativeMax = sumGroups(groups, "formative", groupMax);
  const summativeMax = sumGroups(groups, "summative", groupMax);
  console.log('formativeMax*****',formativeMax)

  console.log('summativeMax*****',summativeMax)

  return studentRows.map(({ row: rowNo, student_id }) => {
    const formative = sumGroups(groups, "formative", (g) => groupObtained(sheet, rowNo, g));
    const summative = sumGroups(groups, "summative", (g) => groupObtained(sheet, rowNo, g));
    const grand = readNumber(sheet.getCell(rowNo, layout.grand_col));

    return {
      exam_scheme_id: examSchemeId,
      student_id,
      subject_id: subjectId,
      exam_configure_id: examConfigureId ?? null,

      formative_obtained: formative,
      formative_max: formativeMax,
      formative_converted: null,
      formative_grade: null,
      formative_pass: null,

      summative_obtained: summative,
      summative_max: summativeMax,
      summative_converted: null,
      summative_grade: null,
      summative_pass: null,

      total_obtained: grand ?? (formative || 0) + (summative || 0),
      total_max: (formativeMax || 0) + (summativeMax || 0),
      total_grade: null,
      grade_point: null,
      is_pass: null,

      is_included_in_total: true,
      is_absent: false,
    };
  });
};

module.exports = { buildStudentSubjectResults };
