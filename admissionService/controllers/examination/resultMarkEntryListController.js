const asyncHandler = require('express-async-handler');
const {
  result_mark_entry_list,
  par_student_personal_information,
  student_mark,
  exam_scheme,
  exam_name,
  class_master,
  term,
  division_master,
  Subject,
  exam_assessment,
  assessment_component,
  assessment_group,
  exam_configure,
  student_head_result,
  student_subject_result,
  component,
  Program,
  semester,
  grade_scale,
  grade_scale_range,
  sequelize,
} = require('../../models');
const { httpError, toNumberOrNull, toBoolean, getQueryValue } = require('./examHelper');
const { getDataTable } = require('../../helper');
const { buildStudentSubjectResults } = require('../../utils/buildStudentSubject');
const { buildStudentHeadResults } = require('../../utils/buildStudentHead');
const ExcelJS = require('exceljs');
const pdfMake = require('pdfmake');
const Roboto = require('pdfmake/fonts/Roboto');
const { where } = require('sequelize');


const schemeInclude = [
  { model: exam_name, as: 'examNameInfo', attributes: ['id', 'exam_name'] },
  { model: class_master, as: 'classInfo', attributes: ['id', 'class_name'] },
  { model: term, as: 'termInfo', attributes: ['id', 'term_name'] },
  { model: Program, as: 'programInfo', attributes: ['id', 'program_name'] },
  { model: semester, as: 'semesterInfo', attributes: ['id', 'semester'] },
];


const MARK_STATUSES = ['present', 'absent', 'exempt'];


const entryListInclude = [
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
];

const marksInclude = {
  model: student_mark,
  as: 'marks',
  separate: true,
  order: [['student_id', 'ASC'], ['exam_assessment_id', 'ASC'], ['assessment_component_id', 'ASC']],
};

const getAssessmentAndComponent = async (exam_scheme_id, subject_id) => {
  let query = `select ea.exam_scheme_id, ea.id as exam_assessment_id,ac.id as assessment_component_id from exam_assessments ea left join assessment_components as ac on ea.id=ac.exam_assessment_id where ea.exam_scheme_id=:exam_scheme_id and ea.subject_id=:subject_id order by ea.sequence, ac.sequence;`
  let result = await sequelize.query(query, { replacements: { exam_scheme_id, subject_id }, type: sequelize.QueryTypes.SELECT })
  return result
}
const getStudents = async (class_id, division_id) => {
  let query = `select id,first_name,last_name,class,division from par_student_personal_informations where class=:class_id and division=:division_id;`
  let result = await sequelize.query(query, { replacements: { class_id, division_id }, type: sequelize.QueryTypes.SELECT })
  return result
}

const markKey = (row) => [row.student_id, row.exam_assessment_id, row.assessment_component_id ?? 0].join('|');

const makePayload = (result_mark_entry_list_id, allassesmentandcomponentData, studentsData) => {
  let payload = []
  for (let student of studentsData) {
    for (let assessment of allassesmentandcomponentData) {
      payload.push({
        result_mark_entry_list_id: result_mark_entry_list_id,
        student_id: student.id,
        exam_assessment_id: assessment.exam_assessment_id,
        assessment_component_id: assessment.assessment_component_id
      })
    }
  }
  return payload
}



const loadColumns = async (exam_scheme_id, subject_id) => {
  const schemeId = exam_scheme_id;
  const subjectId = subject_id;
  const scheme = await exam_scheme.findOne({
    where: { id: schemeId },
    include: schemeInclude,
  });
  const where = { exam_scheme_id: schemeId, subject_id: subjectId };
  const assessments = await exam_assessment.findAll({
    where,
    include: [
      { model: Subject, as: 'subjectInfo', attributes: ['id', 'value', 'abbreviation_name'] },
      { model: component, as: 'componentInfo', attributes: ['id', 'component_name', 'type'] },
      {
        model: assessment_component,
        as: 'components',
        include: [{ model: component, as: 'componentInfo', attributes: ['id', 'component_name', 'type'] }],
      },
      { model: assessment_group, as: 'groupInfo', attributes: ['id', 'group'] },
    ],
    order: [

      ['sequence', 'ASC'],
      [{ model: assessment_component, as: 'components' }, 'sequence', 'ASC'],
    ],
  });
  return assessments

}

// Heads of every subject in the scheme, merged into one per group + head component,
// so the report card header shows each head once. Sub-components are merged the same way.
const loadSchemeHeads = async (exam_scheme_id, class_id, term_id) => {
  const assessments = await exam_assessment.findAll({
    where: { exam_scheme_id },
    include: [
      { model: exam_scheme, as: 'scheme', attributes: [], where: { class_id, term_id } },
      { model: component, as: 'componentInfo', attributes: ['id', 'component_name', 'type'] },
      {
        model: assessment_component,
        as: 'components',
        include: [{ model: component, as: 'componentInfo', attributes: ['id', 'component_name', 'type'] }],
      },
      { model: assessment_group, as: 'groupInfo', attributes: ['id', 'group'] },
    ],
    order: [
      ['sequence', 'ASC'],
      ['subject_id', 'ASC'],
      [{ model: assessment_component, as: 'components' }, 'sequence', 'ASC'],
    ],
  });

  const heads = new Map();
  for (const row of assessments) {
    const assessment = row.get({ plain: true });
    // Incomplete rows (no group/head) create "undefined" PDF columns — skip them
    if (!assessment.group_id || !assessment.component_id || !assessment.groupInfo) continue;

    const key = `${assessment.group_id}|${assessment.component_id}`;
    const head = heads.get(key);
    if (!head) {
      heads.set(key, assessment);
      continue;
    }
    for (const sub of assessment.components) {
      if (!head.components.some((c) => c.component_id === sub.component_id)) head.components.push(sub);
    }
  }
  return [...heads.values()];

}

const groupKind = (name) => {
  const n = String(name || '').trim().toLowerCase();
  if (n === 'formative') return 'formative';
  if (n === 'summative' || n === 'submative') return 'summative';
  return null;
};

// Head max = sum of its sub-component max marks (or its own max_marks when it has none).
// Group max = sum of (head max x head ratio), same as buildStudentSubjectResults.
const buildMaxMarks = (assessments) => {
  const heads = assessments.map((a) => {
    const headMax = a.components.length
      ? a.components.reduce((s, c) => s + Number(c.max_marks || 0), 0)
      : Number(a.max_marks || 0);
    return {
      exam_assessment_id: a.id,
      max_marks: headMax,
      kind: groupKind(a.groupInfo?.group),
      weighted: headMax * (Number(a.ratio) || 1),
    };
  });

  const sumKind = (kind) => {
    const list = heads.filter((h) => h.kind === kind);
    return list.length ? list.reduce((s, h) => s + h.weighted, 0) : null;
  };
  const formative_max = sumKind('formative');
  const summative_max = sumKind('summative');

  return {
    heads,
    formative_max,
    summative_max,
    total_max: (formative_max || 0) + (summative_max || 0),
  };
};


// Updates existing rows in one UPDATE ... JOIN per 500 rows instead of one query per row.
// keyCols find the row (<=> so NULL matches NULL), valueCols are the only columns changed.
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

// Heads grouped the same way as the PDF header (groups in first-seen order)
const groupHeads = (heads) => {
  const groups = [];
  heads.forEach((head) => {
    let group = groups.find((g) => g.id === head.group_id);
    if (!group) {
      group = { id: head.group_id, name: head.groupInfo?.group, assessments: [] };
      groups.push(group);
    }
    group.assessments.push(head);
  });
  return groups;
};

// Builds every student's table rows (one row per subject) in the same column order as the header:
// marks come from student_marks, Total / Total Converted from student_head_results,
// group totals, grades and the grand total from student_subject_results.
// Returns Map(student_id -> rows).
const getStudentMarksRow = async (exam_scheme_id, studentIds, heads) => {
  const rowsByStudent = new Map();
  if (!studentIds.length) return rowsByStudent;

  const select = (sql) =>
    sequelize.query(sql, {
      replacements: { exam_scheme_id, studentIds },
      type: sequelize.QueryTypes.SELECT,
    });
  const [assessmentRows, markRows, headRows, subjectRows] = await Promise.all([
    select(`SELECT ea.id AS exam_assessment_id, ea.subject_id, s.value AS subject_name, ea.group_id, ea.component_id,
              ac.id AS assessment_component_id, ac.component_id AS sub_component_id
            FROM exam_assessments ea
            JOIN Subjects s ON s.id = ea.subject_id
            LEFT JOIN assessment_components ac ON ac.exam_assessment_id = ea.id
            WHERE ea.exam_scheme_id = :exam_scheme_id
            ORDER BY ea.subject_id`),
    select(`SELECT sm.student_id, sm.exam_assessment_id, sm.assessment_component_id, sm.marks
            FROM student_marks sm
            JOIN exam_assessments ea ON ea.id = sm.exam_assessment_id
            WHERE ea.exam_scheme_id = :exam_scheme_id AND sm.student_id IN (:studentIds)`),
    select(`SELECT student_id, exam_assessment_id, obtained, converted
            FROM student_head_results
            WHERE exam_scheme_id = :exam_scheme_id AND student_id IN (:studentIds)`),
    select(`SELECT student_id, subject_id, formative_obtained, formative_grade, summative_obtained, summative_grade,
              total_obtained, total_grade
            FROM student_subject_results
            WHERE exam_scheme_id = :exam_scheme_id AND student_id IN (:studentIds)`),
  ]);

  // Each subject has its own assessment ids; find them by group + head component (+ sub component)
  const subjects = new Map();
  const assessmentByKey = new Map();
  assessmentRows.forEach((r) => {
    subjects.set(r.subject_id, r.subject_name);
    const key = `${r.subject_id}|${r.group_id}|${r.component_id}`;
    if (!assessmentByKey.has(key)) assessmentByKey.set(key, { id: r.exam_assessment_id, subs: new Map() });
    if (r.assessment_component_id) {
      assessmentByKey.get(key).subs.set(r.sub_component_id, r.assessment_component_id);
    }
  });
  const marks = new Map(
    markRows.map((r) => [`${r.student_id}|${r.exam_assessment_id}|${r.assessment_component_id ?? 0}`, r.marks])
  );
  const headResults = new Map(headRows.map((r) => [`${r.student_id}|${r.exam_assessment_id}`, r]));
  const subjectResults = new Map(subjectRows.map((r) => [`${r.student_id}|${r.subject_id}`, r]));

  const show = (v) => (v === null || v === undefined || v === '' ? '-' : String(Number.isNaN(Number(v)) ? v : Number(v)));
  const cell = (v, bold = false) => ({ text: show(v), style: 'cell', bold });
  const groups = groupHeads(heads);

  studentIds.forEach((studentId) => {
    const rows = [];
    subjects.forEach((subjectName, subjectId) => {
      const subjectResult = subjectResults.get(`${studentId}|${subjectId}`);
      const row = [{ text: subjectName, style: 'subject' }];

      groups.forEach((group) => {
        group.assessments.forEach((head) => {
          const assessment = assessmentByKey.get(`${subjectId}|${head.group_id}|${head.component_id}`);
          const subs = head.components.length ? head.components : [null];
          subs.forEach((sub) => {
            const subId = sub ? assessment?.subs.get(sub.component_id) : 0;
            row.push(cell(assessment && subId !== undefined ? marks.get(`${studentId}|${assessment.id}|${subId}`) : null));
          });
          const headResult = assessment ? headResults.get(`${studentId}|${assessment.id}`) : null;
          row.push(cell(headResult?.obtained), cell(headResult?.converted));
        });

        const kind = groupKind(group.name);
        row.push(cell(kind && subjectResult?.[`${kind}_obtained`], true), cell(kind && subjectResult?.[`${kind}_grade`], true));
      });

      row.push(cell(subjectResult?.total_obtained, true), cell(subjectResult?.total_grade, true));
      rows.push(row);
    });
    rowsByStudent.set(studentId, rows);
  });

  return rowsByStudent;
};

// Co-scholastic subject + grade per student (keyed by reg_no).
// Layout is SUBJECT | GRADE | SUBJECT | GRADE — odd items left, even items right.
const loadCoScholasticByStudent = async (exam_scheme_id, division_id) => {
  const rows = await sequelize.query(
    `SELECT csm.student_reg_no, csm.grade, s.value AS subject_name
     FROM student_co_scholastic_marks csm
     INNER JOIN result_mark_entry_lists rmel ON rmel.id = csm.result_mark_entry_list_id
     INNER JOIN Subjects s ON s.id = rmel.subject_id
     WHERE rmel.exam_scheme_id = :exam_scheme_id
       AND rmel.division_id = :division_id
     ORDER BY s.value ASC, csm.id ASC`,
    {
      replacements: { exam_scheme_id, division_id },
      type: sequelize.QueryTypes.SELECT,
    }
  );

  const byRegNo = new Map();
  for (const row of rows) {
    const key = String(row.student_reg_no);
    if (!byRegNo.has(key)) byRegNo.set(key, []);
    byRegNo.get(key).push({
      subject: row.subject_name || '-',
      grade: row.grade == null || String(row.grade).trim() === '' ? '-' : String(row.grade).trim(),
    });
  }
  return byRegNo;
};

const buildCoScholasticTable = (items, title) => {
  const list = Array.isArray(items) ? items : [];
  const headerCell = (text) => ({ text, style: 'tableHeader', alignment: 'center' });
  const subjectCell = (text) => ({ text: text || '', style: 'subject' });
  const gradeCell = (text) => ({ text: text || '', style: 'cell', bold: true });
  const empty = { text: '', style: 'cell' };

  const body = [
    [{ text: title, style: 'tableHeader', colSpan: 4, alignment: 'left' }, {}, {}, {}],
    [headerCell('SUBJECT'), headerCell('GRADE'), headerCell('SUBJECT'), headerCell('GRADE')],
  ];

  if (!list.length) {
    body.push([empty, empty, empty, empty]);
  } else {
    for (let i = 0; i < list.length; i += 2) {
      const left = list[i];
      const right = list[i + 1];
      body.push([
        subjectCell(left.subject),
        gradeCell(left.grade),
        right ? subjectCell(right.subject) : empty,
        right ? gradeCell(right.grade) : empty,
      ]);
    }
  }

  return {
    table: {
      widths: ['*', 60, '*', 60],
      body,
    },
    layout: {
      hLineWidth: (i, node) => (i === 0 || i === 1 || i === 2 || i === node.table.body.length ? 0.8 : 0.4),
      vLineWidth: () => 0.4,
      hLineColor: () => '#333',
      vLineColor: () => '#333',
      paddingLeft: () => 4,
      paddingRight: () => 4,
      paddingTop: () => 3,
      paddingBottom: () => 3,
    },
    margin: [0, 10, 0, 0],
  };
};

const fonts = {
  Roboto: {
    normal: 'fonts/Roboto-Regular.ttf',
    bold: 'fonts/Roboto-Medium.ttf',
    italics: 'fonts/Roboto-Italic.ttf',
    bolditalics: 'fonts/Roboto-MediumItalic.ttf'
  }
};


const resultMarkEntryListController = {

  generateResultPdf: asyncHandler(async (req, res) => {
    
    pdfMake.addFonts(Roboto);

    const { exam_scheme_id, class_id, term_id ,division_id} = req.body;
    if (!exam_scheme_id || !class_id || !term_id || !division_id) {
      return res.status(400).json({ success: false, message: 'exam_scheme_id, class_id, term_id and division_id are required' });
    }
    
    let students=await par_student_personal_information.findAll({
      where:{
        class:class_id,
        division:division_id
      },
      attributes:['id','reg_no','rollnumber','first_name','last_name','father_name','dob'],
      include:[
        { model: class_master, as: 'classInfo', attributes: ['class_name'] },
        { model: division_master, as: 'divisionInfo', attributes: ['division_name'] },
      ],
      order:[['rollnumber','ASC'],['first_name','ASC']],
      raw:true,
      nest:true,
    })
    if (!students.length) {
      return res.status(404).json({ success: false, message: 'No students found for this class and division' });
    }

    const assessments = await loadSchemeHeads(exam_scheme_id, class_id, term_id);
    const rowsByStudent = await getStudentMarksRow(exam_scheme_id, students.map((s) => s.id), assessments);
    const columnCount = buildMarksHeader(assessments)[0].length;
    const coScholasticByStudent = await loadCoScholasticByStudent(exam_scheme_id, division_id);

    const termInfo = await term.findByPk(term_id, { attributes: ['term_name'] });
    const termName = termInfo?.term_name || '';
    const gradeScaleLegend = await sequelize.query(
      `SELECT gsr.grade, gsr.description
       FROM exam_configures ec
       INNER JOIN grade_scales gs ON gs.id = ec.grade_scale_id AND gs.type = 'descriptor'
       INNER JOIN grade_scale_ranges gsr ON gsr.grade_scale_id = gs.id
       WHERE ec.exam_id = :exam_scheme_id
         AND ec.class_id = :class_id
         AND ec.term_id = :term_id
         AND ec.subject_id IN (
           SELECT DISTINCT rmel.subject_id
           FROM result_mark_entry_lists rmel
           INNER JOIN student_co_scholastic_marks csm ON csm.result_mark_entry_list_id = rmel.id
           WHERE rmel.exam_scheme_id = :exam_scheme_id AND rmel.division_id = :division_id
         )
       ORDER BY gsr.sequence ASC, gsr.id ASC`,
      {
        replacements: { exam_scheme_id, class_id, term_id, division_id },
        type: sequelize.QueryTypes.SELECT,
      }
    );
    const uniqueScale = [];
    const seenGrade = new Set();
    for (const row of gradeScaleLegend) {
      const key = String(row.grade || '').toUpperCase();
      if (!key || seenGrade.has(key)) continue;
      seenGrade.add(key);
      uniqueScale.push(`${row.grade}${row.description ? ` - ${row.description}` : ''}`);
    }
    const coScholasticTitle = uniqueScale.length
      ? `Co-Scholastic Area : ${termName} [Grading Scale as follows: ${uniqueScale.join(',')}]`
      : `Co-Scholastic Area : ${termName}`;

    // One page per student: title, student information, then the marks table with that student's subject rows
    const show = (value) => (value === null || value === undefined || value === '' ? '-' : value);
    // dob is a text column holding either "YYYY-MM-DD" or a full ISO timestamp
    const showDate = (value) => {
      const match = String(value ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
      return match ? `${match[3]}/${match[2]}/${match[1]}` : show(value);
    };
    const studentPages = students.flatMap((student, index) => [
      {
        text: 'PROGRESS REPORT - 2025-26',
        style: 'mainTitle',
        alignment: 'center',
        margin: [0, 0, 0, 10],
        ...(index > 0 ? { pageBreak: 'before' } : {}),
      },
      {
        // House, GR No., height, weight and attendance are not stored for students yet
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [
              { text: `Name of the Student : ${show([student.first_name, student.last_name, student.father_name].filter(Boolean).join(' '))}`, fontSize: 9 },
              { text: `Date of Birth : ${showDate(student.dob)}`, fontSize: 9 },
              { text: `Class : ${show(student.classInfo?.class_name)}`, fontSize: 9 },
              { text: `Div : ${show(student.divisionInfo?.division_name)}`, fontSize: 9 }
            ],
            [
              { text: `Roll No. : ${show(student.rollnumber)}`, fontSize: 9 },
              { text: 'House : -', fontSize: 9 },
              { text: `Reg No. : ${show(student.reg_no)}`, fontSize: 9 },
              { text: 'Height : - cm', fontSize: 9 }
            ],
            [
              { text: 'Weight : - kg', fontSize: 9 },
              { text: 'Attendance : - / -', fontSize: 9 },
              { text: '', fontSize: 9 },
              { text: '', fontSize: 9 }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#444',
          vLineColor: () => '#444',
          paddingLeft: () => 4,
          paddingRight: () => 4,
          paddingTop: () => 3,
          paddingBottom: () => 3
        },
        margin: [0, 0, 0, 10]
      },
      {
        table: {
          headerRows: 3,
          widths: [70, ...Array(columnCount - 1).fill('*')],
          body: [...buildMarksHeader(assessments), ...(rowsByStudent.get(student.id) || [])],
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === 3 || i === node.table.body.length) ? 0.8 : 0.4,
          vLineWidth: () => 0.4,
          hLineColor: () => '#333',
          vLineColor: () => '#333',
          paddingLeft: () => 2,
          paddingRight: () => 2,
          paddingTop: () => 3,
          paddingBottom: () => 3
        }
      },
      buildCoScholasticTable(
        coScholasticByStudent.get(String(student.reg_no)) || [],
        coScholasticTitle
      ),
    ]);
    const docDefinition = {
      pageSize: 'A4',
      pageOrientation: 'landscape',
      pageMargins: [20, 25, 20, 25],
    
      content: [
        // Data rows
        //makeRow('ENGLISH LITERATURE', 16, 8, 5, 7, 16, 6, 5, 7, 14, 'B2', 75, 75, 'A1', 89, 'A2'),
        ...studentPages,
      ],
    
      styles: {
        schoolName: { fontSize: 13, bold: true },
        mainTitle: { fontSize: 12, bold: true },
        tableHeader: {
          fontSize: 6,
          bold: true,
          fillColor: '#e8e8e8',
          alignment: 'center'
        },
        cell: { fontSize: 8, alignment: 'center' },
        subject: { fontSize: 7.5, bold: true, alignment: 'left' }
      },
    
      defaultStyle: {
        fontSize: 8
      }
    };
    
    // Same columns as the marks entry Excel: SUBJECT is the only fixed column,
    // and a Grade column follows every group total and the grand total.
    function buildMarksHeader(assessments) {
      const groups = groupHeads(assessments);

      // Spanned cells still need {} placeholders so every row has the same number of cells
      const rows = [[], [], []];
      const add = (rowNo, text, rowSpan = 1, colSpan = 1) => {
        const cell = { text, style: 'tableHeader' };
        if (rowSpan > 1) cell.rowSpan = rowSpan;
        if (colSpan > 1) cell.colSpan = colSpan;
        rows[rowNo].push(cell);
        for (let c = 1; c < colSpan; c++) rows[rowNo].push({});
        for (let r = rowNo + 1; r < rowNo + rowSpan; r++) {
          for (let c = 0; c < colSpan; c++) rows[r].push({});
        }
      };

      add(0, 'SUBJECT', 3);
      let grandMax = 0;
      groups.forEach((group) => {
        const groupMax = group.assessments.reduce((s, a) => s + Number(a.max_marks || 0), 0);
        const groupCols = group.assessments.reduce((s, a) => s + (a.components.length || 1) + 2, 0);
        grandMax += groupMax;

        add(0, `${group.name} Marks`, 1, groupCols);
        group.assessments.forEach((a) => {
          const components = a.components || [];
          add(1, `${a.componentInfo?.component_name} (${Number(a.max_marks)})`, 1, (components.length || 1) + 2);
          if (components.length) {
            components.forEach((c) => add(2, `${c.componentInfo?.component_name} (${Number(c.max_marks)})`));
          } else {
            add(2, `Marks (${Number(a.max_marks)})`);
          }
          const subHeadTotal = components.length
            ? components.reduce((s, c) => s + Number(c.max_marks || 0), 0)
            : Number(a.max_marks || 0);
          add(2, `Total (${subHeadTotal})`);
          add(2, `Total Converted (${Number(a.max_marks)})`);
        });
        add(0, `${group.name} Total Marks (${groupMax})`, 3);
        add(0, `${group.name} Grade`, 3);
      });
      add(0, `Grand Total (${grandMax})`, 3);
      add(0, 'Total Grade', 3);
      return rows;
    }



    // Helper function
    function makeRow(subject, w1, cp1, nb1, avg1, w2, cp2, nb2, avg2, formTotal, formGrade, sumAvg, sumTotal, sumGrade, marks, overall) {
      return [
        { text: subject, style: 'subject' },
        { text: String(w1), style: 'cell' },
        { text: String(cp1), style: 'cell' },
        { text: String(nb1), style: 'cell' },
        { text: String(avg1), style: 'cell' },
        { text: String(w2), style: 'cell' },
        { text: String(cp2), style: 'cell' },
        { text: String(nb2), style: 'cell' },
        { text: String(avg2), style: 'cell' },
        { text: String(formTotal), style: 'cell', bold: true },
        { text: formGrade, style: 'cell', bold: true },
        { text: String(sumAvg), style: 'cell' },
        { text: String(sumTotal), style: 'cell' },
        { text: sumGrade, style: 'cell', bold: true },
        { text: String(marks), style: 'cell', bold: true },
        { text: overall, style: 'cell', bold: true }
      ];
    }
    
    const buffer = await pdfMake.createPdf(docDefinition).getBuffer();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="Progress_Report_2025-26.pdf"');
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  
  
  
   
   
  
  }),

 


  importMarks: asyncHandler(async (req, res) => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.getWorksheet("Marks");
    const meta = workbook.getWorksheet("Meta");
    if (!sheet || !meta) {
      return res.status(400).json({ success: false, message: "Invalid file" });
    }
    // 1. Read the Meta sheet
    const metaValues = {};
    meta.eachRow((r) => { metaValues[r.getCell(1).text] = r.getCell(2).text; });
    const resultMarkEntryId = Number(metaValues.result_mark_entry_id);
    const startRow = Number(metaValues.data_start_row) || 6;
    const layout = JSON.parse(metaValues.layout);
    const studentIdByRow = new Map(
      JSON.parse(metaValues.students || "[]").map((s) => [s.row, s.student_id])
    );
    console.log('termid************************', metaValues.term_id)




    const markColumns = layout.groups.flatMap((g) =>
      g.heads.flatMap((h) =>
        h.marks.map((m) => ({
          col: m.col,
          assessment_id: h.assessment_id,
          assessment_component_id: m.assessment_component_id,
          max_marks: m.max_marks,
        }))
      )
    );

    const rows = [];
    const errors = [];
    const studentIds = new Set();
    for (let r = startRow; r <= sheet.rowCount; r += 1) {
      const studentId = studentIdByRow.get(r);
      if (!studentId) continue;
      studentIds.add(studentId);
      markColumns.forEach((c) => {
        const raw = sheet.getCell(r, c.col).value;
        const value = raw && typeof raw === "object" && "result" in raw ? raw.result : raw;
        const marks = value === null || value === "" ? null : Number(value);
        if (marks !== null && (!Number.isFinite(marks) || marks < 0 || marks > c.max_marks)) {
          errors.push({ row: r, column: sheet.getColumn(c.col).letter, message: `Marks must be 0-${c.max_marks}` });
          return;
        }
        rows.push({
          result_mark_entry_list_id: resultMarkEntryId,
          student_id: studentId,
          exam_assessment_id: c.assessment_id,
          assessment_component_id: c.assessment_component_id ?? null,
          marks,
        });
      });
    }

    const groupIds = layout.groups.map((g) => g.group_id);
    const groups = await assessment_group.findAll({ where: { id: groupIds } });
    const groupNameById = new Map(groups.map((g) => [g.id, g.group]));

    const studentRows = JSON.parse(metaValues.students || "[]");
    const headResults = buildStudentHeadResults({
      sheet,
      layout,
      studentRows,
      examSchemeId: Number(metaValues.exam_scheme_id),
      subjectId: Number(metaValues.subject_id),
    });
    const subjectResults = buildStudentSubjectResults({
      sheet,
      layout,
      studentRows,
      headResults,
      groupNameById,
      examSchemeId: Number(metaValues.exam_scheme_id),
      subjectId: Number(metaValues.subject_id),
    });

    if (errors.length) {
      return res.status(400).json({ success: false, message: "Some marks are invalid. Nothing was saved.", errors });
    }

    await sequelize.transaction(async (transaction) => {
      await bulkUpdate(
        'student_marks',
        ['result_mark_entry_list_id', 'student_id', 'exam_assessment_id', 'assessment_component_id'],
        ['marks'],
        rows,
        transaction
      );
      await bulkUpdate(
        'student_subject_results',
        ['exam_scheme_id', 'student_id', 'subject_id'],
        ['formative_obtained', 'summative_obtained', 'total_obtained'],
        subjectResults,
        transaction
      );
      await bulkUpdate(
        'student_head_results',
        ['exam_scheme_id', 'student_id', 'subject_id', 'exam_assessment_id'],
        ['obtained', 'converted'],
        headResults,
        transaction
      );
    });

    res.json({ success: true, message: "Marks entered successfully" });









  }),


  create: asyncHandler(async (req, res) => {
    let body = req.body;
    let { class_id, division_id, exam_scheme_id, term_id, subject_id, sort_by } = body
    if (!exam_scheme_id || !class_id || !division_id || !subject_id) {
      return res.status(400).json({ message: 'exam_scheme_id, class_id, division_id and subject_id are required' })
    }

    // ---------- STEP 1: load the subject's heads / sub-components and the division's students ----------
    let [allassesmentandcomponent, students] = await Promise.allSettled([getAssessmentAndComponent(exam_scheme_id, subject_id), getStudents(class_id, division_id)])

    let allassesmentandcomponentData = [];
    let studentsData = []
    console.log('students****************>', students.value)



    if (allassesmentandcomponent.status === 'fulfilled' && students.status === 'fulfilled') {
      allassesmentandcomponentData = allassesmentandcomponent.value
      studentsData = students.value

    }
    else {
      return res.status(400).json({ message: 'Failed to get assessment and component or students' })
    }
    console.log('allassesmentandcomponentData****>>>>>', allassesmentandcomponentData);

    // ---------- STEP 2: load the heads with max marks and the exam configure of this subject ----------
    const [assessments, examConfigure] = await Promise.all([
      loadColumns(exam_scheme_id, subject_id),
      exam_configure.findOne({
        where: { exam_id: exam_scheme_id, class_id, term_id, subject_id },
        attributes: ['id', 'is_included_in_total'],
      }),
    ]);
    const maxMarks = buildMaxMarks(assessments);

    // ---------- STEP 3: prepare rows for student_head_results and student_subject_results ----------
    // One head row per student per head (with max marks) and one subject row per student
    const headRows = [];
    const subjectRows = [];
    for (const student of studentsData) {
      for (const head of maxMarks.heads) {
        headRows.push({
          exam_scheme_id,
          student_id: student.id,
          subject_id,
          exam_assessment_id: head.exam_assessment_id,
          max_marks: head.max_marks,
        });
      }
      subjectRows.push({
        exam_scheme_id,
        student_id: student.id,
        subject_id,
        exam_configure_id: examConfigure?.id ?? null,
        formative_max: maxMarks.formative_max,
        summative_max: maxMarks.summative_max,
        total_max: maxMarks.total_max,
        is_included_in_total: examConfigure?.is_included_in_total ?? true,
      });
    }

    // ---------- STEP 4: save everything in one transaction (any failure rolls back all of it) ----------
    const entryWhere = { exam_scheme_id, division_id, subject_id };
    const { entryId, isNewEntry } = await sequelize.transaction(async (transaction) => {
      // Entry list: create it, or only update sort_by when it already exists
      let entry = await result_mark_entry_list.findOne({ where: entryWhere, transaction });
      const isNewEntry = !entry;
      if (entry) {
        await entry.update({ searchbystudent: sort_by ?? null }, { transaction });
      } else {
        entry = await result_mark_entry_list.create(
          { ...entryWhere, searchbystudent: sort_by ?? null },
          { transaction }
        );
      }

      // ===== SAVE 1: student_marks (always saved) =====
      // One row per student per head / sub-component; for an existing entry only missing rows are added
      const payload = makePayload(entry.id, allassesmentandcomponentData, studentsData);
      let newRows = payload;
      if (!isNewEntry) {
        const existingRows = await student_mark.findAll({
          where: { result_mark_entry_list_id: entry.id },
          attributes: ['student_id', 'exam_assessment_id', 'assessment_component_id'],
          raw: true,
          transaction,
        });
        const existingKeys = new Set(existingRows.map(markKey));
        newRows = payload.filter((row) => !existingKeys.has(markKey(row)));
      }

      for (let i = 0; i < newRows.length; i += 1000) {
        await student_mark.bulkCreate(newRows.slice(i, i + 1000), { transaction });
      }

      // ===== SAVE 2: student_head_results =====
      // Existing rows keep their obtained/grade/pass values; only max_marks is refreshed
      const headKey = (row) => `${row.student_id}|${row.exam_assessment_id}`;
      const existingHeads = await student_head_result.findAll({
        where: { exam_scheme_id, subject_id, student_id: studentsData.map((s) => s.id) },
        attributes: ['student_id', 'exam_assessment_id'],
        raw: true,
        transaction,
      });
      const existingHeadKeys = new Set(existingHeads.map(headKey));
      const newHeadRows = headRows.filter((row) => !existingHeadKeys.has(headKey(row)));

      for (const head of maxMarks.heads) {
        await student_head_result.update(
          { max_marks: head.max_marks },
          { where: { exam_scheme_id, subject_id, exam_assessment_id: head.exam_assessment_id }, transaction }
        );
      }
      for (let i = 0; i < newHeadRows.length; i += 1000) {
        await student_head_result.bulkCreate(newHeadRows.slice(i, i + 1000), { transaction });
      }

      // ===== SAVE 3: student_subject_results =====
      // Inserts new rows; existing rows only get the config link and max marks refreshed
      if (subjectRows.length) {
        await student_subject_result.bulkCreate(subjectRows, {
          updateOnDuplicate: [
            'exam_configure_id',
            'formative_max',
            'summative_max',
            'total_max',
            'is_included_in_total',
            'updatedAt',
          ],
          transaction,
        });
      }

      return { entryId: entry.id, isNewEntry };
    });

    // ---------- STEP 5: response ----------
    const data = await result_mark_entry_list.findByPk(entryId, {
      include: [...entryListInclude, marksInclude],
    });
    res.status(isNewEntry ? 201 : 200).json({
      success: true,
      message: isNewEntry ? 'Mark entry created successfully' : 'Mark entry updated successfully',
      data,
    });


  }),
  generateresult: asyncHandler(async (req, res) => {
    let body = req.body;
    let { class_id, division_id, exam_scheme_id, term_id } = body
    let student = await getStudents(class_id, division_id);

    let allconfig = await exam_configure.findAll({ where: { exam_id: exam_scheme_id, class_id: class_id, term_id: term_id } })
    for (let config of allconfig) {
      let studentresults = await student_subject_result.findAll({
        where: {
          exam_scheme_id: exam_scheme_id,
          subject_id: config.subject_id,
          student_id: student.map((s) => s.id),
        },
      })
      let grade = null;
      grade = await grade_scale.findOne(
        {
          where: {
            id: config.grade_scale_id
          },
          include: [
            {
              model: grade_scale_range,
              as: 'ranges',
              attributes: ['id', 'grade_scale_id', 'min_percent', 'max_percent', 'grade']
            }
          ],
        })

      for (let studentresult of studentresults) {

       let formative_converted=config?.formative_ratio*studentresult?.formative_obtained
       let summative_converted=config?.summative_ratio*studentresult?.summative_obtained
       let total_converted_marks=formative_converted+summative_converted;

        if(!config.is_separate_passing){
          console.log('enter in loop')
          await studentresult.update({
            formative_converted:formative_converted,
            summative_converted:summative_converted,
            formative_pass:formative_converted>=config.formative_passing?1:0,
            summative_pass:summative_converted>=config.summative_passing?1:0,
            formative_grade:grade?.ranges.find(g=>formative_converted>=g.min_percent&&formative_converted<=g.max_percent)?.grade,
            summative_grade:grade?.ranges.find(g=>summative_converted>=g.min_percent&&summative_converted<=g.max_percent)?.grade,
            is_pass:total_converted_marks>=config.total_passing?1:0,
            total_grade:grade?.ranges.find(g=>total_converted_marks>=g.min_percent&&total_converted_marks<=g.max_percent)?.grade,
          })

        }
      }
    }
    res.json({ success: true, message:"Result generated successfully" })
  }),

  getAll: asyncHandler(async (req, res) => {
    const filters = {
      exam_scheme_id: ['exam_scheme_id', 'examSchemeId'],
      division_id: ['division_id', 'divisionId'],
      subject_id: ['subject_id', 'subjectId'],
      '$scheme.exam_name_id$': ['exam_name_id', 'examId'],
      '$scheme.class_id$': ['class_id', 'classId'],
      '$scheme.term_id$': ['term_id', 'termId'],
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

    const include = toBoolean(getQueryValue(req.query, 'include_marks'))
      ? [...entryListInclude, marksInclude]
      : entryListInclude;

    const result = await getDataTable(req, result_mark_entry_list, ['searchbystudent'], where, include);
    res.json(result);
  }),

  getallstudentbyresultmarkentrylist: asyncHandler(async (req, res) => {
    const entryListId = toNumberOrNull(req.params.id);
    console.log('entrylistid:::::::::::::::::::',entryListId)
    if (!entryListId) throw httpError(400, 'Valid result mark entry list id is required');

    const query = `select distinct p.id, p.reg_no, p.rollnumber, p.first_name, p.last_name, p.father_name
      from student_marks sm
      inner join par_student_personal_informations p on p.id = sm.student_id
      where sm.result_mark_entry_list_id = :entryListId
      order by p.rollnumber, p.first_name;`;
    const data = await sequelize.query(query, {
      replacements: { entryListId },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({ success: true, count: data.length, data });
  }),

  getallco_scholasticstudentbyresultmarkentrylist: asyncHandler(async (req, res) => {
    const entryListId = toNumberOrNull(req.params.id);
    if (!entryListId) throw httpError(400, 'Valid result mark entry list id is required');

    const query = `select distinct p.id, p.reg_no, p.rollnumber, p.first_name, p.last_name, p.father_name
      from student_co_scholastic_marks csm
      inner join par_student_personal_informations p on p.reg_no = csm.student_reg_no
      where csm.result_mark_entry_list_id = :entryListId
      order by p.rollnumber, p.first_name;`;
    const data = await sequelize.query(query, {
      replacements: { entryListId },
      type: sequelize.QueryTypes.SELECT,
    });

    res.json({ success: true, count: data.length, data });
  }),
};

module.exports = resultMarkEntryListController;
