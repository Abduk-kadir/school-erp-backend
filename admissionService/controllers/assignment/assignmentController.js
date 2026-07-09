const asyncHandler = require('express-async-handler');
const { QueryTypes } = require('sequelize');
const { assignment, sequelize, par_student_personal_information, student_subject } = require('../../models');
const filterStudent = require('../../utils/filterStudent');
const { sendBulkNotification } = require('../../services/notificationService');

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
    await sendBulkNotification(students, 'Diaryyyy',
      'notes  are sent',
      {
        type: 'notes',
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
    const division = req.query['filter[division]'] || '';
    const batch = req.query['filter[batch]'] || '';

    const whereClause = [];
    if (fromDate && toDate) {
      whereClause.push(`DATE(asg.\`createdAt\`) BETWEEN '${fromDate}' AND '${toDate}'`);
    } else if (fromDate) {
      whereClause.push(`DATE(asg.\`createdAt\`) >= '${fromDate}'`);
    } else if (toDate) {
      whereClause.push(`DATE(asg.\`createdAt\`) <= '${toDate}'`);
    }
    if (className) {
      whereClause.push(`cm.\`class_name\` LIKE '%${className}%'`);
    }
    if (division) {
      whereClause.push(`asg.\`division\` = ${division}`);
    }
    if (batch) {
      whereClause.push(`asg.\`batch\` = ${batch}`);
    }
    const whereSql = whereClause.length ? ` where ${whereClause.join(' and ')}` : '';
    const query = `select asg.*, bt.batch_name, cm.class_name, dv.division_name, sb.value as subject_name, CONCAT_WS(' ', sf.surname, sf.firstname, sf.lastname) as staff_name from assignments
   as asg join batches as bt on asg.batch=bt.id
   join division_masters as dv on asg.division= dv.id
   join class_masters as cm on asg.class = cm.id
   join Subjects as sb on asg.subject = sb.id
   left join StaffRegistrations as sf on asg.staffid = sf.id
   ${whereSql}
   LIMIT ${length} OFFSET ${start}`;

    const result = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      raw: true,
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
      draw,
    });
  }),

  getAssignmentStudent: asyncHandler(async (req, res) => {
    let { reg_no } = req.params;
    let student = await par_student_personal_information.findOne({ where: { reg_no: reg_no }, raw: true });
    let classId = student.class;
    let division = student.division;
    let student_subjects = await student_subject.findAll({ where: { student_reg_no: reg_no }, raw: true });
    let subjects = student_subjects.map((subject) => subject.subject_id);
    console.log('student subjects is:***********:',subjects)
    const subjectsSql = subjects.length ? subjects.join(',') : 'null';
    const query = `select asg.*, cm.class_name, dv.division_name, sb.value as subject_name from assignments
   as asg join division_masters as dv on asg.division = dv.id
   join class_masters as cm on asg.class = cm.id
   join Subjects as sb on asg.subject = sb.id
   where asg.class = ${classId} and asg.division = ${division} and asg.subject in (${subjectsSql})`;
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
