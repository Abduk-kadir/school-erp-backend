const asyncHandler = require('express-async-handler');
const { QueryTypes } = require('sequelize');
const { timetable, batch, class_master, division_master, sequelize, par_student_personal_information } = require('../../models');
const filterStudent = require('../../utils/filterStudent');
const { sendBulkNotification } = require('../../services/notificationService');
const timetableController = {
  create: asyncHandler(async (req, res) => {
    const batchId = req.body.batch ?? req.body.batchId;
    const classId = req.body.class ?? req.body.classId;
    const division = req.body.division ?? req.body.divisionId;
    const staffid = req.body.staffid ?? req.body.staffId;
    const { valid_from } = req.body;

    if (!batchId || !classId || !division || !valid_from) {
      return res.status(400).json({
        success: false,
        message:
          'batch/batchId, class/classId, division/divisionId, and valid_from are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Timetable file is required (field name: timetable)',
      });
    }

    const timetable_url = `/uploads/timetable/${req.file.filename}`;

    const newTimetable = await timetable.create({
      batch: batchId,
      class: classId,
      division,
      staffid,
      valid_from,
      timetable_url,
    });

    const row = {class:classId,division};
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
      message: 'Timetable created',
      data: newTimetable,
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
    const division = req.query['filter[divisionId]'] || '';
    const batch = req.query['filter[batchId]'] || '';
    


    const whereClause = [];
    if (fromDate && toDate) {
      whereClause.push(`DATE(tm.\`createdAt\`) BETWEEN '${fromDate}' AND '${toDate}'`);
    } else if (fromDate) {
      whereClause.push(`DATE(tm.\`createdAt\`) >= '${fromDate}'`);
    } else if (toDate) {
      whereClause.push(`DATE(tm.\`createdAt\`) <= '${toDate}'`);
    }
    if (className) {
      whereClause.push(`cm.\`class_name\` LIKE '%${className}%'`);
    }
    if (division) {
      whereClause.push(`tm.\`division\` = ${division}`);
    }
    if (batch) {
      whereClause.push(`tm.\`batch\` = ${batch}`);
    }
    const whereSql = whereClause.length ? ` where ${whereClause.join(' and ')}` : '';
    const query = `select tm.*, bt.batch_name, cm.class_name, dv.division_name, CONCAT_WS(' ', sf.surname, sf.firstname) as staff_name from timetables
   as tm join batches as bt on tm.batch=bt.id
   join division_masters as dv on tm.division= dv.id
   join class_masters as cm on tm.class = cm.id
   left join StaffRegistrations as sf on tm.staffid = sf.id
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

  getTimetableStudent: asyncHandler(async (req, res) => {
    let { reg_no } = req.params;
    let student = await par_student_personal_information.findOne({ where: { reg_no: reg_no }, raw: true });
    let classId = student.class;
    let division = student.division;
    console.log('classId is**********:',classId)
    console.log('division is**********:',division)
    const query = `select tm.*, cm.class_name, dv.division_name from timetables
   as tm join division_masters as dv on tm.division = dv.id
   join class_masters as cm on tm.class = cm.id
   where tm.class = ${classId} and tm.division = ${division}`;
    const timetables = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      raw: true,
    });
    return res.status(200).json({
      success: true,
      data: timetables,
    });
  }),
};

module.exports = timetableController;
