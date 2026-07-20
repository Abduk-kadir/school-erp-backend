const asyncHandler = require('express-async-handler');
const fs = require('fs');
const { QueryTypes } = require('sequelize');
const { diary, sequelize,studentFcmtoken,par_student_personal_information,student_subject} = require('../../models');
const {sendBulkNotification} = require('../../services/notificationService');
const filterStudent = require('../../utils/filterStudent');
const DOCUMENT_FIELD_NAMES = [
  'diary',
  'document',
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

function mapDiaryRow(row) {
  return {
    class: row.class ?? row.classId,
    batch: row.batch ?? row.batchId,
    division: row.division ?? row.divisionId,
    subject: row.subject ?? row.subjectId,
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
    const single = mapDiaryRow(req.body || {});
    if (
      single.class &&
      single.batch &&
      single.division &&
      single.subject &&
      single.message
    ) {
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

const diaryController = {
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

    const rows = rowsResult;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'rows must be a non-empty array',
      });
    }

    const diary_url = documentFile
      ? `/uploads/diary/${documentFile.filename}`
      : null;
    const recordsToCreate = rows.map((elem) => ({
      ...mapDiaryRow(elem),
      diary_url,
    }));

    const invalid = recordsToCreate.find(
      (r) =>
        !r.class || !r.batch || !r.division || !r.subject || !r.message
    );
    if (invalid) {
      return res.status(400).json({
        success: false,
        message:
          'Each row requires class/classId, batch/batchId, division/divisionId, subject/subjectId, and message',
      });
    }

    const transaction = await sequelize.transaction();
    let records;
    try {
      records = await diary.bulkCreate(recordsToCreate, {
        transaction,
        validate: true,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }

    //start sending notification
    for (let i = 0; i < recordsToCreate.length; i++) {
      const row = recordsToCreate[i];
      const students = await filterStudent(row);
      console.log('students is***********:', students);
      await sendBulkNotification(students, 'Diaryyyy',
        'Today hhhh diary is sent',
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
      message: 'Diaries are created',
      count: records.length,
      data: records,
    });
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
        `DATE(dr.\`createdAt\`) BETWEEN '${fromDate}' AND '${toDate}'`
      );
    } else if (fromDate) {
      whereClause.push(`DATE(dr.\`createdAt\`) >= '${fromDate}'`);
    } else if (toDate) {
      whereClause.push(`DATE(dr.\`createdAt\`) <= '${toDate}'`);
    }
    if (className) {
      whereClause.push(`dr.\`class\` = ${className}`);
    }
    if (division) {
      whereClause.push(`dr.\`division\` = ${division}`);
    }
    if (batch) {
      whereClause.push(`dr.\`batch\` = ${batch}`);
    }
    const whereSql = whereClause.length
      ? ` where ${whereClause.join(' and ')}`
      : '';
    const query = `select dr.*, bt.batch_name, cm.class_name, dv.division_name, sb.value as subject_name, CONCAT_WS(' ', sf.surname, sf.firstname) as staff_name from diaries
   as dr join batches as bt on dr.batch=bt.id
   join division_masters as dv on dr.division= dv.id
   join class_masters as cm on dr.class = cm.id
   join Subjects as sb on dr.subject = sb.id
   left join StaffRegistrations as sf on dr.staffid = sf.id
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
  getDiaryStudent:asyncHandler(async(req,res)=>{
    let {reg_no}=req.params;
    let student=await par_student_personal_information.findOne({where:{reg_no:reg_no},raw:true})
    let classId=student.class;
    let division=student.division
    let student_subjects=await student_subject.findAll({where:{student_reg_no:reg_no},raw:true})
    let subjects=student_subjects.map(subject=>subject.subject_id)
    console.log('student subjects is:***********:',subjects)
    const subjectsSql = subjects.length ? subjects.join(',') : 'null';
    const query = `select dr.*, cm.class_name, dv.division_name, sb.value as subject_name from diaries
   as dr join division_masters as dv on dr.division = dv.id
   join class_masters as cm on dr.class = cm.id
   join Subjects as sb on dr.subject = sb.id
   where dr.class = ${classId} and dr.division = ${division} and dr.subject in (${subjectsSql})`;
    const diaries = await sequelize.query(query, {
      type: QueryTypes.SELECT,
      raw: true,
    });
    return res.status(200).json({
      success: true,
      data: diaries,
    })
  })
};

module.exports = diaryController;
