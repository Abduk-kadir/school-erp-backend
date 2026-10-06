const asyncHandler = require('express-async-handler');
const { QueryTypes } = require('sequelize');
const { assignment, sequelize, par_student_personal_information, student_subject,ProgramSubject } = require('../../models');
const filterStudent = require('../../utils/filterStudent');
const { sendBulkNotification } = require('../../services/notificationService');
const { generatePdf } = require('../../utils/generatePdf');
const { generateExcel } = require('../../utils/generateExcel');

const ASSIGNMENT_REPORT_COLUMNS = ['Date', 'Class', 'Division', 'Batch', 'Subject', 'Staff', 'Title', 'Submission Date', 'Submission Time'];

async function getAssignmentReportRows(query) {
  const start = parseInt(query.start) || 0;
  const length = parseInt(query.length) || 10;
  const fromDate = query['filter[fromDate]'] || '';
  const toDate = query['filter[toDate]'] || '';
  const className = query['filter[className]'] || '';
  const division = query['filter[divisionId]'] || query['filter[division]'] || '';
  const batch = query['filter[batchId]'] || query['filter[batch]'] || '';

  const whereClause = [];
  const replacements = { start, length };
  if (fromDate && toDate) {
    whereClause.push('DATE(asg.createdAt) BETWEEN :fromDate AND :toDate');
    replacements.fromDate = fromDate;
    replacements.toDate = toDate;
  } else if (fromDate) {
    whereClause.push('DATE(asg.createdAt) >= :fromDate');
    replacements.fromDate = fromDate;
  } else if (toDate) {
    whereClause.push('DATE(asg.createdAt) <= :toDate');
    replacements.toDate = toDate;
  }
  if (className) {
    whereClause.push('asg.class = :className');
    replacements.className = Number(className);
  }
  if (division) {
    whereClause.push('asg.division = :division');
    replacements.division = Number(division);
  }
  if (batch) {
    whereClause.push('asg.batch = :batch');
    replacements.batch = Number(batch);
  }
  const whereSql = whereClause.length ? `where ${whereClause.join(' and ')}` : '';

  const rows = await sequelize.query(
    `select DATE_FORMAT(asg.createdAt, '%Y-%m-%d') as date, cm.class_name, dv.division_name, bt.batch_name,
      sb.value as subject_name, CONCAT_WS(' ', sf.surname, sf.firstname) as staff_name, asg.title,
      DATE_FORMAT(asg.submission_date, '%Y-%m-%d') as submission_date, asg.submission_time
   from assignments as asg
   join batches as bt on asg.batch = bt.id
   join division_masters as dv on asg.division = dv.id
   join class_masters as cm on asg.class = cm.id
   join Subjects as sb on asg.subject = sb.id
   left join StaffRegistrations as sf on asg.staffid = sf.id
   ${whereSql}
   order by asg.createdAt desc
   LIMIT :length OFFSET :start`,
    { replacements, type: QueryTypes.SELECT, raw: true }
  );

  const cell = (v) => (v == null ? '' : String(v));
  return rows.map((r) => [
    cell(r.date),
    cell(r.class_name),
    cell(r.division_name),
    cell(r.batch_name),
    cell(r.subject_name),
    cell(r.staff_name),
    cell(r.title),
    cell(r.submission_date),
    cell(r.submission_time),
  ]);
}

const assignmentController = {
  create: asyncHandler(async (req, res) => {
    const batchId = req.body.batch ?? req.body.batchId;
    const classId = req.body.class ?? req.body.classId;
    const division = req.body.division ?? req.body.divisionId;
    const subject = req.body.subject ?? req.body.subjectId;
    const staffid = req.body.staffid ?? req.body.staffId;
    const { submission_date, submission_time, title } = req.body;

    if (
      !classId ||
      !batchId ||
      !division ||
      !subject ||
      !submission_date ||
      !submission_time ||
      !title
    ) {
      return res.status(400).json({
        success: false,
        message:
          'class/classId, batch/batchId, division/divisionId, subject/subjectId, submission_date, submission_time, and title are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Assignment file is required (field name: assignment)',
      });
    }

    const assignment_url = `/uploads/assignment/${req.file.filename}`;

    const newAssignment = await assignment.create({
      class: classId,
      batch: batchId,
      division,
      subject,
      staffid,
      submission_date,
      submission_time,
      title,
      assignment_url,
    });
    const row = {class:classId,division,subject};
    const students = await filterStudent(row);
    console.log('students is***********:', students);
    await sendBulkNotification(students, 'Assignment',
      row.message,
      {
        type: 'assignment',
        examId: '12345',
        url: '/notification-diary',
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      }
    );
    return res.status(201).json({
      success: true,
      message: 'Assignment created',
      data: newAssignment,
    });
  }),

  getAll: asyncHandler(async (req, res) => {
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const search = req.query['search[value]'] || req.query.search?.value || '';
    const fromDate = req.query['filter[fromDate]'] || '';
    const toDate = req.query['filter[toDate]'] || '';
    const className = req.query['filter[className]'] || '';
    const division = req.query['filter[divisionId]'] || req.query['filter[division]'] || '';
    const batch = req.query['filter[batchId]'] || req.query['filter[batch]'] || '';

    const whereClause = [];
    if (fromDate && toDate) {
      whereClause.push(`DATE(asg.\`createdAt\`) BETWEEN '${fromDate}' AND '${toDate}'`);
    } else if (fromDate) {
      whereClause.push(`DATE(asg.\`createdAt\`) >= '${fromDate}'`);
    } else if (toDate) {
      whereClause.push(`DATE(asg.\`createdAt\`) <= '${toDate}'`);
    }
    if (className) {
      whereClause.push(`asg.\`class\` = ${className}`);
    }
    if (division) {
      whereClause.push(`asg.\`division\` = ${division}`);
    }
    if (batch) {
      whereClause.push(`asg.\`batch\` = ${batch}`);
    }
    const whereSql = whereClause.length ? ` where ${whereClause.join(' and ')}` : '';

    const fromJoins = `from assignments as asg
   join batches as bt on asg.batch=bt.id
   join division_masters as dv on asg.division= dv.id
   join class_masters as cm on asg.class = cm.id
   join Subjects as sb on asg.subject = sb.id
   left join StaffRegistrations as sf on asg.staffid = sf.id`;

    const query = `select asg.*, bt.batch_name, cm.class_name, dv.division_name, sb.value as subject_name, CONCAT_WS(' ', sf.surname, sf.firstname) as staff_name ${fromJoins}
   ${whereSql}
   LIMIT ${length} OFFSET ${start}`;

    const [[totalRow], [filteredRow], result] = await Promise.all([
      sequelize.query(`select COUNT(*) as total ${fromJoins}`, {
        type: QueryTypes.SELECT,
        raw: true,
      }),
      sequelize.query(`select COUNT(*) as total ${fromJoins} ${whereSql}`, {
        type: QueryTypes.SELECT,
        raw: true,
      }),
      sequelize.query(query, {
        type: QueryTypes.SELECT,
        raw: true,
      }),
    ]);

    const recordsTotal = Number(totalRow?.total ?? 0);
    const recordsFiltered = Number(filteredRow?.total ?? 0);

    return res.status(200).json({
      success: true,
      draw,
      recordsTotal,
      recordsFiltered,
      count: result.length,
      data: result,
    });
  }),

  assignmentPdf: asyncHandler(async (req, res) => {
    const buffer = await generatePdf({
      title: 'Assignments',
      columns: ASSIGNMENT_REPORT_COLUMNS,
      data: await getAssignmentReportRows(req.query),
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=assignments.pdf');
    res.send(buffer);
  }),

  assignmentExcel: asyncHandler(async (req, res) => {
    const buffer = await generateExcel({
      title: 'Assignments',
      columns: ASSIGNMENT_REPORT_COLUMNS,
      data: await getAssignmentReportRows(req.query),
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=assignments.xlsx');
    res.send(buffer);
  }),

  getAssignmentStudent: asyncHandler(async (req, res) => {
    let { reg_no } = req.params;
    let student = await par_student_personal_information.findOne({ where: { reg_no: reg_no }, raw: true });
    let classId = student.class;
    let division = student.division;
    let student_subjects = await ProgramSubject.findAll({ where: { classId: classId }, raw: true });
    let subjects = student_subjects.map((subject) => subject.subjectId);
    console.log('student subjects is:***********:',subjects)
    const subjectsSql = subjects.length ? subjects.join(',') : 'null';
    const query = `select asg.*, cm.class_name, dv.division_name, sb.value as subject_name from assignments
   as asg join division_masters as dv on asg.division = dv.id
   join class_masters as cm on asg.class = cm.id
   join Subjects as sb on asg.subject = sb.id
   where asg.class = ${classId} and asg.division = ${division} and asg.subject in (${subjectsSql}) order by asg.createdAt desc`;
    const assignments = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      raw: true,
    });
    return res.status(200).json({
      success: true,
      data: assignments,
    });
  }),
};

module.exports = assignmentController;
