const asyncHandler = require('express-async-handler');
const fs = require('fs');
const { QueryTypes } = require('sequelize');
const { studentnotification, sequelize, par_student_personal_information } = require('../../models');
const filterStudent = require('../../utils/filterStudent');
const { sendBulkNotification } = require('../../services/notificationService');
const { generatePdf } = require('../../utils/generatePdf');
const { generateExcel } = require('../../utils/generateExcel');

const NOTIFICATION_REPORT_COLUMNS = ['Date', 'Class', 'Division', 'Batch', 'Staff', 'Message'];

async function getNotificationReportRows(query) {
  const start = parseInt(query.start) || 0;
  const length = parseInt(query.length) || 10;
  const fromDate = query['filter[fromDate]'] || '';
  const toDate = query['filter[toDate]'] || '';
  const className = query['filter[className]'] || '';
  const division = query['filter[divisionId]'] || '';
  const batch = query['filter[batchId]'] || '';

  const whereClause = [];
  const replacements = { start, length };
  if (fromDate && toDate) {
    whereClause.push('DATE(sn.createdAt) BETWEEN :fromDate AND :toDate');
    replacements.fromDate = fromDate;
    replacements.toDate = toDate;
  } else if (fromDate) {
    whereClause.push('DATE(sn.createdAt) >= :fromDate');
    replacements.fromDate = fromDate;
  } else if (toDate) {
    whereClause.push('DATE(sn.createdAt) <= :toDate');
    replacements.toDate = toDate;
  }
  if (className) {
    whereClause.push('sn.class = :className');
    replacements.className = Number(className);
  }
  if (division) {
    whereClause.push('sn.division = :division');
    replacements.division = Number(division);
  }
  if (batch) {
    whereClause.push('sn.batch = :batch');
    replacements.batch = Number(batch);
  }
  const whereSql = whereClause.length ? `where ${whereClause.join(' and ')}` : '';

  const rows = await sequelize.query(
    `select DATE_FORMAT(sn.createdAt, '%Y-%m-%d') as date, cm.class_name, dv.division_name, bt.batch_name,
      CONCAT_WS(' ', sf.surname, sf.firstname) as staff_name, sn.message
   from student_notifications as sn
   join batches as bt on sn.batch = bt.id
   join division_masters as dv on sn.division = dv.id
   join class_masters as cm on sn.class = cm.id
   left join StaffRegistrations as sf on sn.staffid = sf.id
   ${whereSql}
   order by sn.createdAt desc
   LIMIT :length OFFSET :start`,
    { replacements, type: QueryTypes.SELECT, raw: true }
  );

  const cell = (v) => (v == null ? '' : String(v));
  return rows.map((r) => [
    cell(r.date),
    cell(r.class_name),
    cell(r.division_name),
    cell(r.batch_name),
    cell(r.staff_name),
    cell(r.message),
  ]);
}

const DOCUMENT_FIELD_NAMES = [
  'document',
  'notification',
  'file',
  'attachment',
  'upload',
];

function getUploadedFiles(req) {
  if (req.files && typeof req.files === 'object' && !Array.isArray(req.files)) {
    return Object.values(req.files).flat();
  }
  if (Array.isArray(req.files)) return req.files;
  if (req.file) return [req.file];
  return [];
}

function getDocumentFile(req) {
  const files = getUploadedFiles(req).filter((f) => f.fieldname !== 'rows');
  if (!files.length) return null;
  return (
    files.find((f) => DOCUMENT_FIELD_NAMES.includes(f.fieldname)) || files[0]
  );
}

function mapNotificationRow(row) {
  return {
    class: row.class ?? row.classId,
    batch: row.batch ?? row.batchId,
    division: row.division ?? row.divisionId,
    staffid: row.staffid ?? row.staffId,
    message: row.message,
  };
}

function parseRowsInput(req) {
  let rows = req.body?.rows;
  const uploadedFiles = getUploadedFiles(req);
  const rowsFile = uploadedFiles.find(
    (f) => f.fieldname === 'rows' || f.fieldname === 'rows[]'
  );

  if (!rows && rowsFile) {
    rows = fs.readFileSync(rowsFile.path, 'utf8');
    fs.unlinkSync(rowsFile.path);
  }

  if (!rows) {
    const single = mapNotificationRow(req.body || {});
    if (single.class && single.batch && single.division  && single.message) {
      return [single];
    }
    return null;
  }

  if (typeof rows === 'string') {
    try {
      return JSON.parse(rows);
    } catch {
      return { error: 'rows must be a valid JSON array' };
    }
  }

  if (Array.isArray(rows)) return rows;

  return rows;
}

const studentnotificationController = {
  create: asyncHandler(async (req, res) => {
    const documentFile = getDocumentFile(req);

    const rowsResult = parseRowsInput(req);
    if (!rowsResult) {
      return res.status(400).json({
        success: false,
        message: 'rows is required',
      });
    }
    if (rowsResult.error) {
      return res.status(400).json({
        success: false,
        message: rowsResult.error,
      });
    }

    let rows = rowsResult;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'rows must be a non-empty array',
      });
    }

    const document_url = documentFile
      ? `/uploads/notification/${documentFile.filename}`
      : null;
    const recordsToCreate = rows.map((elem) => ({
      ...mapNotificationRow(elem),
      document_url,
    }));

    const invalid = recordsToCreate.find(
      (r) => !r.class || !r.batch || !r.division || !r.message
    );
    if (invalid) {
      return res.status(400).json({
        success: false,
        message:
          'Each row requires class/classId, batch/batchId, division/divisionId, and message',
      });
    }

    const transaction = await sequelize.transaction();
    try {
      const records = await studentnotification.bulkCreate(recordsToCreate, {
        transaction,
        validate: true,
      });
      await transaction.commit();
      //start sending notification
    for (let i = 0; i < recordsToCreate.length; i++) {
      const row = recordsToCreate[i];
      const students = await filterStudent(row);
      console.log('students is***********:', students);
      await sendBulkNotification(students, 'Notification',row.message,
        {
          type: 'exam',
          examId: '12345',
          url: '/notification-diary',
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        }
      );
    }
    //end sending notification


      return res.status(201).json({
        success: true,
        message: 'notifications are created',
        count: records.length,
        data: records,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }),

  getAll: asyncHandler(async (req, res) => {
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const fromDate = req.query['filter[fromDate]'] || '';
    const toDate = req.query['filter[toDate]'] || '';
    const className = req.query['filter[className]'] || '';
    const division = req.query['filter[divisionId]'] || '';
    const batch = req.query['filter[batchId]'] || '';

    const whereClause = [];
    if (fromDate && toDate) {
      whereClause.push(
        `DATE(sn.\`createdAt\`) BETWEEN '${fromDate}' AND '${toDate}'`
      );
    } else if (fromDate) {
      whereClause.push(`DATE(sn.\`createdAt\`) >= '${fromDate}'`);
    } else if (toDate) {
      whereClause.push(`DATE(sn.\`createdAt\`) <= '${toDate}'`);
    }
    if (className) {
      whereClause.push(`sn.\`class\` = ${className}`);
    }
    if (division) {
      whereClause.push(`sn.\`division\` = ${division}`);
    }
    if (batch) {
      whereClause.push(`sn.\`batch\` = ${batch}`);
    }
    const whereSql = whereClause.length
      ? ` where ${whereClause.join(' and ')}`
      : '';

    const fromJoins = `from student_notifications as sn
   join batches as bt on sn.batch=bt.id
   join division_masters as dv on sn.division= dv.id
   join class_masters as cm on sn.class = cm.id
   left join StaffRegistrations as sf on sn.staffid = sf.id`;

    const query = `select sn.*, bt.batch_name, cm.class_name, dv.division_name, CONCAT_WS(' ', sf.surname, sf.firstname) as staff_name ${fromJoins}
   ${whereSql}
   order by sn.createdAt desc
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

  notificationPdf: asyncHandler(async (req, res) => {
    const buffer = await generatePdf({
      title: 'Student Notifications',
      columns: NOTIFICATION_REPORT_COLUMNS,
      data: await getNotificationReportRows(req.query),
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=student-notifications.pdf');
    res.send(buffer);
  }),

  notificationExcel: asyncHandler(async (req, res) => {
    const buffer = await generateExcel({
      title: 'Student Notifications',
      columns: NOTIFICATION_REPORT_COLUMNS,
      data: await getNotificationReportRows(req.query),
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=student-notifications.xlsx');
    res.send(buffer);
  }),

  getNotificationStudent: asyncHandler(async (req, res) => {
    let { reg_no } = req.params;
    let student = await par_student_personal_information.findOne({ where: { reg_no: reg_no }, raw: true });
    let classId = student.class;
    let division = student.division;
    const query = `select sn.*, cm.class_name, dv.division_name from student_notifications
   as sn join division_masters as dv on sn.division = dv.id
   join class_masters as cm on sn.class = cm.id
   where sn.class = ${classId} and sn.division = ${division} order by sn.createdAt desc`;
    const notifications = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      raw: true,
    });
    return res.status(200).json({
      success: true,
      data: notifications,
    });
  }),
};

module.exports = studentnotificationController;
