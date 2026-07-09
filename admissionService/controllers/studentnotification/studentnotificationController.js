const asyncHandler = require('express-async-handler');
const fs = require('fs');
const { QueryTypes } = require('sequelize');
const { studentnotification, sequelize, par_student_personal_information } = require('../../models');
const filterStudent = require('../../utils/filterStudent');
const { sendBulkNotification } = require('../../services/notificationService');

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

    if (!documentFile) {
      return res.status(400).json({
        success: false,
        message: 'Document file is required',
      });
    }

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

    const document_url = `/uploads/notification/${documentFile.filename}`;
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
      await sendBulkNotification(students, 'notification is sent',
        'notification is sent',
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
    const query = `select sn.*, bt.batch_name, cm.class_name, dv.division_name, CONCAT_WS(' ', sf.surname, sf.firstname, sf.lastname) as staff_name from student_notifications
   as sn join batches as bt on sn.batch=bt.id
   join division_masters as dv on sn.division= dv.id
   join class_masters as cm on sn.class = cm.id
   left join StaffRegistrations as sf on sn.staffid = sf.id
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

  getNotificationStudent: asyncHandler(async (req, res) => {
    let { reg_no } = req.params;
    let student = await par_student_personal_information.findOne({ where: { reg_no: reg_no }, raw: true });
    let classId = student.class;
    let division = student.division;
    const query = `select sn.*, cm.class_name, dv.division_name from student_notifications
   as sn join division_masters as dv on sn.division = dv.id
   join class_masters as cm on sn.class = cm.id
   where sn.class = ${classId} and sn.division = ${division}`;
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
