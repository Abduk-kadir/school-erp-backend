const asyncHandler = require('express-async-handler');
const { AttendanceLecturewise, sequelize } = require('../../models');
const { Op } = require('sequelize');

const BATCH_SIZE = 500;

function getRowsFromBody(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && Array.isArray(body.attendances)) return body.attendances;
  return null;
}

function mapRow(row) {
  return {
    reg_no: row.reg_no,
    attendance_date: row.attendance_date ?? row.date,
    subjectid: row.subjectid ?? row.subject_id ?? null,
    attendance: row.attendance != null ? Number(row.attendance) : 0,
    staffid: row.staffid ?? row.staff_id ?? null,
  };
}

const attendanceLecturewiseController = {
  create: asyncHandler(async (req, res) => {
    const rows = getRowsFromBody(req.body);
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'Request body must be a non-empty array (or { rows: [...] } / { data: [...] })',
      });
    }

    const payload = rows.map(mapRow);

    const invalid = payload.find((r) => !r.reg_no || !r.attendance_date);
    if (invalid) {
      const err = new Error('Each row requires reg_no and attendance_date');
      err.statusCode = 400;
      throw err;
    }

    for (let i = 0; i < payload.length; i += BATCH_SIZE) {
      const chunk = payload.slice(i, i + BATCH_SIZE);
      await AttendanceLecturewise.bulkCreate(chunk, {
        validate: true,
        updateOnDuplicate: ['attendance', 'staffid', 'updatedAt'],
      });
    }

    // MySQL bulkCreate does not return auto-increment id on composite PKs; re-fetch
    const conditions = payload.map((r) => ({
      reg_no: r.reg_no,
      attendance_date: r.attendance_date,
      subjectid: r.subjectid,
    }));

    const data = await AttendanceLecturewise.findAll({
      where: { [Op.or]: conditions },
      order: [
        ['reg_no', 'ASC'],
        ['attendance_date', 'ASC'],
        ['subjectid', 'ASC'],
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Lecture-wise attendance created',
      count: data.length,
      data,
    });
  }),
  getstudentLecturewise:asyncHandler(async(req,res)=>{
    const {classId,division,subject}=req.query;
    const students=await sequelize.query(`select sts.id,st.reg_no,st.first_name,st.class,st.division,sts.semester,sts.subject_id,sts.elective_bbasket_id from par_student_personal_informations as st join par_student_subjects  as sts on st.reg_no=sts.student_reg_no where st.class=${classId} and st.division=${division} and sts.subject_id=${subject};`,{type:sequelize.QueryTypes.SELECT});
    return res.status(200).json({
      success:true,
      data:students,
    });
  })
   ,lecturewiseReport:asyncHandler(async(req,res)=>{
    let allsubject=await sequelize.query(`select id,value from subjects;`,{type:sequelize.QueryTypes.SELECT});
    let query=`select sts.id,st.reg_no,st.first_name,st.class,st.division,sts.subject_id,sts.semester,sub.value,att.attendance_date,att.attendance,att.staffid,staff.firstname
from  par_student_subjects as sts left join par_student_personal_informations as st  on st.reg_no=sts.student_reg_no 
join subjects as sub on sub.id=sts.subject_id
LEFT JOIN attendance_lecturewises as att on att.subjectid=sts.subject_id
left join staffregistrations as staff on staff.id=att.staffid
;
select st.reg_no,st.first_name,st.class,st.division,
MAX(staff.firstname) AS staff,
MAX(CASE WHEN sub.value='Maths' THEN staff.firstname END) AS Math,
MAX(CASE WHEN sub.value='Urdu' THEN staff.firstname END) AS Urdu,
COUNT(DISTINCT att.id) AS total_lectures,                    -- Total lectures conducted
SUM(att.attendance) AS total_present

from  par_student_subjects as sts left join par_student_personal_informations as st  on st.reg_no=sts.student_reg_no 
join subjects as sub on sub.id=sts.subject_id
LEFT JOIN attendance_lecturewises as att on att.subjectid=sts.subject_id
left join staffregistrations as staff on staff.id=att.staffid
 GROUP BY
    st.reg_no,
    st.first_name,
    st.class,
    st.division`

  })
};


module.exports = attendanceLecturewiseController;
