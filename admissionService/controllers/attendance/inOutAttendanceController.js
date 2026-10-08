const asyncHandler = require('express-async-handler');
const { InOutAttendance, sequelize, Sequelize } = require('../../models');
const {generatePdf} = require('../../utils/generatePdf');
const { generateExcel } = require('../../utils/generateExcel');
function getRowsFromBody(body) {
  if (Array.isArray(body)) return body;
  if (body && Array.isArray(body.rows)) return body.rows;
  if (body && Array.isArray(body.data)) return body.data;
  if (body && Array.isArray(body.inOutAttendances)) return body.inOutAttendances;
  return null;
}

function mapInOutAttendanceRow(row) {
  return {
    reg_no: row.reg_no,
    attendance_date: row.attendance_date ?? row.date,
    in_time: row.in_time ?? null,
    in_time_notification_flag: Boolean(row.in_time_notification_flag ?? false),
    out_time: row.out_time ?? null,
    out_time_notification_flag: Boolean(row.out_time_notification_flag ?? false),
  };
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHLY_FIXED_COLUMN_COUNT = 5;

function getMonthlyRangeDates(fromDate, toDate) {
  const [fy, fm, fd] = String(fromDate).split('-').map(Number);
  const [ty, tm, td] = String(toDate).split('-').map(Number);
  const cursor = new Date(Date.UTC(fy, fm - 1, fd));
  const end = new Date(Date.UTC(ty, tm - 1, td));
  const dates = [];
  while (cursor <= end) {
    dates.push({ year: cursor.getUTCFullYear(), month: cursor.getUTCMonth() + 1, day: cursor.getUTCDate() });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

// One row per student; a range like 15 Sep - 12 Oct reads two monthlyattendances rows per student.
async function getMonthlyReportExportData(query) {
  const pick = (key) => query[`filter[${key}]`] || query[key] || '';
  const classId = pick('className') || pick('classId');
  const divisionId = pick('divisionId') || pick('division');
  const today = new Date();
  const fromDate = pick('fromDate') || `${today.getFullYear()}-${today.getMonth() + 1}-1`;
  const toDate = pick('toDate') || `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const dates = getMonthlyRangeDates(fromDate, toDate);

  const columns = [
    'Reg No', 'Name', 'Class', 'Division', 'Roll No',
    ...dates.map((d) => `${d.day} ${MONTH_NAMES[d.month - 1]}`),
    'Present', 'Absent', 'Working Days', 'Present %',
  ];
  if (!classId || !divisionId || dates.length === 0) {
    return { columns, rows: [], dayCount: dates.length };
  }

  const months = [...new Map(dates.map((d) => [`${d.year}-${d.month}`, d])).values()];
  const replacements = { classId: Number(classId), divisionId: Number(divisionId) };
  const monthWhere = months
    .map((m, i) => {
      replacements[`year${i}`] = m.year;
      replacements[`month${i}`] = m.month;
      return `(a.year = :year${i} AND a.month_number = :month${i})`;
    })
    .join(' OR ');

  const records = await sequelize.query(
    `SELECT p.reg_no, p.first_name AS name, cm.class_name AS class, dm.division_name AS \`div\`,
       p.reg_no AS roll_no, a.*
     FROM par_student_personal_informations p
     INNER JOIN class_masters cm ON cm.id = p.class
     INNER JOIN division_masters dm ON dm.id = p.division
     INNER JOIN monthlyattendances a ON a.reg_no = p.reg_no
     WHERE p.class = :classId AND p.division = :divisionId AND (${monthWhere})
     ORDER BY p.reg_no ASC`,
    { replacements, type: Sequelize.QueryTypes.SELECT, raw: true }
  );

  const students = new Map();
  for (const r of records) {
    if (!students.has(r.reg_no)) students.set(r.reg_no, { info: r, months: {} });
    students.get(r.reg_no).months[`${r.year}-${r.month_number}`] = r;
  }

  const cell = (v) => (v == null ? '' : String(v));
  const rows = [...students.values()].map(({ info, months: studentMonths }) => {
    let present = 0;
    let absent = 0;
    const dayValues = dates.map((d) => {
      const value = cell(studentMonths[`${d.year}-${d.month}`]?.[d.day]);
      const code = value.trim().charAt(0).toUpperCase();
      if (code === 'P') present += 1;
      if (code === 'A') absent += 1;
      return value;
    });
    const workingDays = present + absent;
    return [
      cell(info.reg_no), cell(info.name), cell(info.class), cell(info.div), cell(info.roll_no),
      ...dayValues,
      String(present), String(absent), String(workingDays),
      `${workingDays ? Math.round((present / workingDays) * 100) : 0}%`,
    ];
  });

  return { columns, rows, dayCount: dates.length };
}








const inOutAttendanceController = {
  create: asyncHandler(async (req, res) => {
    console.log('hitting bulk create*********************************************************************')
    const rows = getRowsFromBody(req.body);
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          'Request body must be a non-empty array (or { rows: [...] } / { data: [...] })',
      });
    }

    const payload = rows.map(mapInOutAttendanceRow);
    const invalid = payload.find(
      (r) => !r.reg_no || !r.attendance_date
    );
    if (invalid) {
      const err = new Error('Each row requires reg_no and attendance_date');
      err.statusCode = 400;
      throw err;
    }

    /*
     * Chunk into batches of 500 to avoid MySQL max_allowed_packet limits
     * on large payloads (e.g. 1285 rows from a full class day).
     * updateOnDuplicate: existing (reg_no + attendance_date) rows get
     * updated instead of skipped.
     * MySQL bulkCreate never fills auto-increment id on composite PKs,
     * so we re-fetch after all batches complete.
     */
  
    const { Op } = require('sequelize');
    const BATCH_SIZE = 500;

    for (let i = 0; i < payload.length; i += BATCH_SIZE) {
      const chunk = payload.slice(i, i + BATCH_SIZE);
      await InOutAttendance.bulkCreate(chunk, {
        validate: true,
        updateOnDuplicate: [
          'in_time',
          'in_time_notification_flag',
          'out_time',
          'out_time_notification_flag',
          'updatedAt',
        ],
      });
    }

    const conditions = payload.map((r) => ({
      reg_no: r.reg_no,
      attendance_date: r.attendance_date,
    }));

    const data = await InOutAttendance.findAll({
      where: { [Op.or]: conditions },
      order: [['reg_no', 'ASC'], ['attendance_date', 'ASC']],
    });

    return res.status(201).json({
      success: true,
      message: 'In/out attendance created',
      count: data.length,
      data,
    });
  }),

  getattendancebyRegAndDate: asyncHandler(async (req, res) => {
    const reg_no =Number(req.params.reg_no);
    const date = req.params.date;

    if (!Number.isFinite(reg_no) || !date) {
      const err = new Error('reg_no and date are required');
      err.statusCode = 400;
      throw err;
    }

    const data = await InOutAttendance.findOne({
      where: { reg_no, attendance_date: date },
    });

    return res.status(200).json({
      success: true,
      data,
    });
  }),
  
  getattendancebyRegAndMonth: asyncHandler(async (req, res) => {
    const { Op } = require('sequelize');
    const reg_no = Number(req.user?.reg_no) || Number(req.params.reg_no);
    const month = req.params.month ?? req.query.month;

    if (!Number.isFinite(reg_no) || !month) {
      const err = new Error('reg_no and month are required');
      err.statusCode = 400;
      throw err;
    }

    const monthMatch = /^(\d{4})-(\d{2})$/.exec(String(month));
    if (!monthMatch) {
      const err = new Error('month must be YYYY-MM');
      err.statusCode = 400;
      throw err;
    }

    const year = Number(monthMatch[1]);
    const monthNum = Number(monthMatch[2]);
    if (monthNum < 1 || monthNum > 12) {
      const err = new Error('month must be YYYY-MM');
      err.statusCode = 400;
      throw err;
    }

    const mm = String(monthNum).padStart(2, '0');
    const from = `${year}-${mm}-01`;
    const lastDay = new Date(year, monthNum, 0).getDate();
    const to = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`;
    const data = await InOutAttendance.findAll({
      where: {
        reg_no,
        attendance_date: { [Op.between]: [from, to] },
      },
      order: [['attendance_date', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      reg_no,
      month: `${year}-${mm}`,
      from,
      to,
      count: data.length,
      data,
    });
  }),
  

  /** report-detail: reg_no, name, class, div, roll_no, date (time range) */
  getDetailReport: asyncHandler(async (req, res) => {
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const search = req.query['search[value]'] || req.query.search?.value || '';

    // Express may parse as filter[key] string keys or nested filter object
    const filter = req.query.filter || {};
    const attendance_date =
      req.query['filter[date]'] || filter.date || '';
    const classId =
      req.query['filter[className]'] ||
      req.query['filter[classId]'] ||
      filter.className ||
      filter.classId ||
      '';
    const divisionId =
      req.query['filter[divisionId]'] ||
      req.query['filter[division]'] ||
      filter.divisionId ||
      filter.division ||
      '';

    // p.class / p.division are INTEGER FKs — match by id, not LIKE name
    const whereClause = ['1 = 1'];
    const replacements = { length, start };

    if (classId) {
      whereClause.push('p.class = :classId');
      replacements.classId = Number(classId);
    }
    if (divisionId) {
      whereClause.push('p.division = :divisionId');
      replacements.divisionId = Number(divisionId);
    }
    if (attendance_date) {
      whereClause.push('a.attendance_date = :attendance_date');
      replacements.attendance_date = attendance_date;
    }

    const sql = `
      SELECT
        p.reg_no,
        p.first_name AS name,
        cm.class_name AS class,
        dm.division_name AS \`div\`,
        p.reg_no AS roll_no,
        a.attendance_date AS \`date\`,
        a.in_time,
        a.out_time
      FROM par_student_personal_informations p
      INNER JOIN class_masters cm ON cm.id = p.class
      INNER JOIN division_masters dm ON dm.id = p.division
      INNER JOIN in_out_attendances a
        ON a.reg_no = p.reg_no
      WHERE ${whereClause.join(' AND ')}
      ORDER BY p.reg_no ASC
      LIMIT :length OFFSET :start
    `;

    const data = await sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
      raw: true,
     
    });

    return res.status(200).json({ success: true, count: data.length, data ,draw});
  }),

  detailReportPdf:asyncHandler(async(req,res)=>{
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const search = req.query['search[value]'] || req.query.search?.value || '';

    // Express may parse as filter[key] string keys or nested filter object
    const filter = req.query.filter || {};
    const attendance_date =
      req.query['filter[date]'] || filter.date || '';
    const classId =
      req.query['filter[className]'] ||
      req.query['filter[classId]'] ||
      filter.className ||
      filter.classId ||
      '';
    const divisionId =
      req.query['filter[divisionId]'] ||
      req.query['filter[division]'] ||
      filter.divisionId ||
      filter.division ||
      '';

    // p.class / p.division are INTEGER FKs — match by id, not LIKE name
    const whereClause = ['1 = 1'];
    const replacements = { length, start };

    if (classId) {
      whereClause.push('p.class = :classId');
      replacements.classId = Number(classId);
    }
    if (divisionId) {
      whereClause.push('p.division = :divisionId');
      replacements.divisionId = Number(divisionId);
    }
    if (attendance_date) {
      whereClause.push('a.attendance_date = :attendance_date');
      replacements.attendance_date = attendance_date;
    }

    const sql = `
      SELECT
        p.reg_no,
        p.first_name AS name,
        cm.class_name AS class,
        dm.division_name AS \`div\`,
        p.reg_no AS roll_no,
        a.attendance_date AS \`date\`,
        a.in_time,
        a.out_time
      FROM par_student_personal_informations p
      INNER JOIN class_masters cm ON cm.id = p.class
      INNER JOIN division_masters dm ON dm.id = p.division
      INNER JOIN in_out_attendances a
        ON a.reg_no = p.reg_no
      WHERE ${whereClause.join(' AND ')}
      ORDER BY p.reg_no ASC
      LIMIT :length OFFSET :start
    `;

    const data = await sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
      raw: true,
     
    });
    const cell = (v) => (v == null ? '' : String(v));
    const buffer = await generatePdf({
      title: 'In-Out Attendance',
      columns: ['Reg No','Name','Class','Division','Roll no','Date',"In Time","Out Time"],
      data: data.map(r => [
        cell(r.reg_no),
        cell(r.name),
        cell(r.class),
        cell(r.div),
        cell(r.roll_no),
        cell(r.date),
        cell(r.in_time),
        cell(r.out_time),
      ]),
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.pdf');
    res.send(buffer);

  }),

  detailReportExcel: asyncHandler(async (req, res) => {
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;

    // Express may parse as filter[key] string keys or nested filter object
    const filter = req.query.filter || {};
    const attendance_date =
      req.query['filter[date]'] || filter.date || '';
    const classId =
      req.query['filter[className]'] ||
      req.query['filter[classId]'] ||
      filter.className ||
      filter.classId ||
      '';
    const divisionId =
      req.query['filter[divisionId]'] ||
      req.query['filter[division]'] ||
      filter.divisionId ||
      filter.division ||
      '';

    // p.class / p.division are INTEGER FKs — match by id, not LIKE name
    const whereClause = ['1 = 1'];
    const replacements = { length, start };

    if (classId) {
      whereClause.push('p.class = :classId');
      replacements.classId = Number(classId);
    }
    if (divisionId) {
      whereClause.push('p.division = :divisionId');
      replacements.divisionId = Number(divisionId);
    }
    if (attendance_date) {
      whereClause.push('a.attendance_date = :attendance_date');
      replacements.attendance_date = attendance_date;
    }

    const sql = `
      SELECT
        p.reg_no,
        p.first_name AS name,
        cm.class_name AS class,
        dm.division_name AS \`div\`,
        p.reg_no AS roll_no,
        a.attendance_date AS \`date\`,
        a.in_time,
        a.out_time
      FROM par_student_personal_informations p
      INNER JOIN class_masters cm ON cm.id = p.class
      INNER JOIN division_masters dm ON dm.id = p.division
      INNER JOIN in_out_attendances a
        ON a.reg_no = p.reg_no
      WHERE ${whereClause.join(' AND ')}
      ORDER BY p.reg_no ASC
      LIMIT :length OFFSET :start
    `;

    const data = await sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
      raw: true,
    });
    const cell = (v) => (v == null ? '' : String(v));
    const buffer = await generateExcel({
      title: 'In-Out Attendance',
      columns: ['Reg No','Name','Class','Division','Roll no','Date',"In Time","Out Time"],
      data: data.map(r => [
        cell(r.reg_no),
        cell(r.name),
        cell(r.class),
        cell(r.div),
        cell(r.roll_no),
        cell(r.date),
        cell(r.in_time),
        cell(r.out_time),
      ]),
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');
    res.send(buffer);
  }),

  

  /** report-summ: class, div, total student, present count, absent count */
  getSummaryReport: asyncHandler(async (req, res) => {
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const search = req.query['search[value]'] || req.query.search?.value || '';
    const today = new Date().toISOString().slice(0, 10);
    const attendance_date = req.query['filter[date]'] || today;
    const className = req.query['filter[className]'] || '';
    const division = req.query['filter[divisionId]'] || '';
    
    const studentFilters = [];
    const replacements = { attendance_date, length, start };

    const attendanceDateSql = 'AND a.attendance_date = :attendance_date';

    if (className) {
      studentFilters.push(`p.class = :className`);
      replacements.className = Number(className);
    }
    if (division) {
      studentFilters.push(`p.division = :division`);
      replacements.division = Number(division);
    }

    const studentWhere = studentFilters.length
      ? ` AND ${studentFilters.join(' AND ')}`
      : '';

    const sql = `
      SELECT
        cm.class_name AS class,
        dm.division_name AS \`div\`,
        COUNT(DISTINCT p.reg_no) AS total_student,
        COUNT(DISTINCT CASE WHEN a.in_time IS NOT NULL AND a.in_time > '00:00:00' THEN a.reg_no END) AS present_count,
        COUNT(DISTINCT CASE WHEN a.attendance_date IS NOT NULL AND (a.in_time IS NULL OR a.in_time <= '00:00:00') THEN a.reg_no END) AS absent_count
      FROM par_student_personal_informations p
      LEFT JOIN class_masters cm ON cm.id = p.class
      LEFT JOIN division_masters dm ON dm.id = p.division
      LEFT JOIN in_out_attendances a
        ON a.reg_no = p.reg_no
        ${attendanceDateSql}
      WHERE 1 = 1
      ${studentWhere}
      GROUP BY p.class, p.division, cm.class_name, dm.division_name
      ORDER BY cm.class_name, dm.division_name
      LIMIT :length OFFSET :start
    `;

    const data = await sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
      raw: true,
    });

    return res.status(200).json({
      success: true,
      draw,
      count: data.length,
      data,
    });
  }),

  summaryReportPdf: asyncHandler(async (req, res) => {
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const today = new Date().toISOString().slice(0, 10);
    const attendance_date = req.query['filter[date]'] || today;
    const className = req.query['filter[className]'] || '';
    const division = req.query['filter[divisionId]'] || '';
    
    const studentFilters = [];
    const replacements = { attendance_date, length, start };

    const attendanceDateSql = 'AND a.attendance_date = :attendance_date';

    if (className) {
      studentFilters.push(`p.class = :className`);
      replacements.className = Number(className);
    }
    if (division) {
      studentFilters.push(`p.division = :division`);
      replacements.division = Number(division);
    }

    const studentWhere = studentFilters.length
      ? ` AND ${studentFilters.join(' AND ')}`
      : '';

    const sql = `
      SELECT
        cm.class_name AS class,
        dm.division_name AS \`div\`,
        COUNT(DISTINCT p.reg_no) AS total_student,
        COUNT(DISTINCT CASE WHEN a.in_time IS NOT NULL AND a.in_time > '00:00:00' THEN a.reg_no END) AS present_count,
        COUNT(DISTINCT CASE WHEN a.attendance_date IS NOT NULL AND (a.in_time IS NULL OR a.in_time <= '00:00:00') THEN a.reg_no END) AS absent_count
      FROM par_student_personal_informations p
      LEFT JOIN class_masters cm ON cm.id = p.class
      LEFT JOIN division_masters dm ON dm.id = p.division
      LEFT JOIN in_out_attendances a
        ON a.reg_no = p.reg_no
        ${attendanceDateSql}
      WHERE 1 = 1
      ${studentWhere}
      GROUP BY p.class, p.division, cm.class_name, dm.division_name
      ORDER BY cm.class_name, dm.division_name
      LIMIT :length OFFSET :start
    `;

    const data = await sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
      raw: true,
    });

    const cell = (v) => (v == null ? '' : String(v));
    const buffer = await generatePdf({
      title: 'In-Out Attendance Summary',
      columns: ['Class', 'Division', 'Total Student', 'Present', 'Absent'],
      data: data.map((r) => [
        cell(r.class),
        cell(r.div),
        cell(r.total_student),
        cell(r.present_count),
        cell(r.absent_count),
      ]),
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-summary.pdf');
    res.send(buffer);
  }),

  summaryReportExcel: asyncHandler(async (req, res) => {
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const today = new Date().toISOString().slice(0, 10);
    const attendance_date = req.query['filter[date]'] || today;
    const className = req.query['filter[className]'] || '';
    const division = req.query['filter[divisionId]'] || '';

    const studentFilters = [];
    const replacements = { attendance_date, length, start };

    const attendanceDateSql = 'AND a.attendance_date = :attendance_date';

    if (className) {
      studentFilters.push(`p.class = :className`);
      replacements.className = Number(className);
    }
    if (division) {
      studentFilters.push(`p.division = :division`);
      replacements.division = Number(division);
    }

    const studentWhere = studentFilters.length
      ? ` AND ${studentFilters.join(' AND ')}`
      : '';

    const sql = `
      SELECT
        cm.class_name AS class,
        dm.division_name AS \`div\`,
        COUNT(DISTINCT p.reg_no) AS total_student,
        COUNT(DISTINCT CASE WHEN a.in_time IS NOT NULL AND a.in_time > '00:00:00' THEN a.reg_no END) AS present_count,
        COUNT(DISTINCT CASE WHEN a.attendance_date IS NOT NULL AND (a.in_time IS NULL OR a.in_time <= '00:00:00') THEN a.reg_no END) AS absent_count
      FROM par_student_personal_informations p
      LEFT JOIN class_masters cm ON cm.id = p.class
      LEFT JOIN division_masters dm ON dm.id = p.division
      LEFT JOIN in_out_attendances a
        ON a.reg_no = p.reg_no
        ${attendanceDateSql}
      WHERE 1 = 1
      ${studentWhere}
      GROUP BY p.class, p.division, cm.class_name, dm.division_name
      ORDER BY cm.class_name, dm.division_name
      LIMIT :length OFFSET :start
    `;

    const data = await sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
      raw: true,
    });

    const cell = (v) => (v == null ? '' : String(v));
    const buffer = await generateExcel({
      title: 'In-Out Attendance Summary',
      columns: ['Class', 'Division', 'Total Student', 'Total Present', 'Total Absent'],
      data: data.map((r) => [
        cell(r.class),
        cell(r.div),
        cell(r.total_student),
        cell(r.present_count),
        cell(r.absent_count),
      ]),
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-summary.xlsx');
    res.send(buffer);
  }),

  /** report-monthly: filter[fromDate], filter[toDate], class, division + pagination */
  getMonthlyReport: asyncHandler(async (req, res) => {
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const search = req.query['search[value]'] || req.query.search?.value || '';
    const filter = req.query.filter || {};
    const classId =
      req.query['filter[className]'] ||
      req.query['filter[classId]'] ||
      filter.className ||
      filter.classId ||
      '';
    const divisionId =
      req.query['filter[divisionId]'] ||
      req.query['filter[division]'] ||
      filter.divisionId ||
      filter.division ||
      '';
    if (!classId || !divisionId) {
      return res.status(200).json({ success: true, count: 0, data: [], draw });
    }
    const fromDate = req.query['filter[fromDate]'];
    const toDate = req.query['filter[toDate]'];
    const startmonthNumber = fromDate ? Number(fromDate.split('-')[1]) : new Date().getMonth() + 1;
    const endmonthNumber = toDate ? Number(toDate.split('-')[1]) : new Date().getMonth() + 1;
    console.log('start month is:::::::::::::::::::::::::::',startmonthNumber)
    console.log('end month is:::::::::::::::::::::::::::',endmonthNumber)
    const whereClause = ['1 = 1'];
    const replacements = { length, start };

    if (classId) {
      whereClause.push('p.class = :classId');
      replacements.classId = Number(classId);
    }
    if (divisionId) {
      whereClause.push('p.division = :divisionId');
      replacements.divisionId = Number(divisionId);
    }
    if(startmonthNumber && endmonthNumber){
      whereClause.push('a.month_number IN (:startmonthNumber, :endmonthNumber)');
      replacements.startmonthNumber=startmonthNumber;
      replacements.endmonthNumber=endmonthNumber;
    }
   
    const sql = `
      SELECT
        a.id as id,
        p.reg_no,
        p.first_name AS name,
        cm.class_name AS class,
        dm.division_name AS \`div\`,
        p.reg_no AS roll_no,
        a.month_number AS \`month_number\`,
        a.\`1\`,
        a.\`2\`,
        a.\`3\`,
        a.\`4\`,
        a.\`5\`,
        a.\`6\`,
        a.\`7\`,
        a.\`8\`,
        a.\`9\`,
        a.\`10\`,
        a.\`11\`,
        a.\`12\`,
        a.\`13\`,
        a.\`14\`,
        a.\`15\`,
        a.\`16\`,
        a.\`17\`,
        a.\`18\`,
        a.\`19\`,
        a.\`20\`,
        a.\`21\`,
        a.\`22\`,
        a.\`23\`,
        a.\`24\`,
        a.\`25\`,
        a.\`26\`,
        a.\`27\`,
        a.\`28\`,
        a.\`29\`,
        a.\`30\`,
        a.\`31\`,
        a.total_present,
        a.total_absent,
        a.total_workingdays,
        a.present_percent
      FROM par_student_personal_informations p
      INNER JOIN class_masters cm ON cm.id = p.class
      INNER JOIN division_masters dm ON dm.id = p.division
      INNER JOIN monthlyattendances a
        ON a.reg_no = p.reg_no
      WHERE ${whereClause.join(' AND ')}
      ORDER BY p.reg_no ASC
      LIMIT :length OFFSET :start
    `;

    const data = await sequelize.query(sql, {
      replacements,
      type: Sequelize.QueryTypes.SELECT,
      raw: true,
     
    });
    
    return res.status(200).json({ success: true, count: data.length, data ,draw});
    
  }),

  monthlyReportPdf: asyncHandler(async (req, res) => {
    const { columns, rows, dayCount } = await getMonthlyReportExportData(req.query);
    const dayEnd = MONTHLY_FIXED_COLUMN_COUNT + dayCount;
    // Up to 40 columns share one A4 page, so each day shows only its P / A code.
    const pdfRows = rows.map((row) =>
      row.map((v, i) => (i >= MONTHLY_FIXED_COLUMN_COUNT && i < dayEnd ? v.trim().charAt(0) : v))
    );
    const buffer = await generatePdf({
      title: 'In-Out Monthly Attendance',
      columns,
      data: pdfRows,
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-monthly.pdf');
    res.send(buffer);
  }),

  monthlyReportExcel: asyncHandler(async (req, res) => {
    const { columns, rows } = await getMonthlyReportExportData(req.query);
    const buffer = await generateExcel({
      title: 'In-Out Monthly Attendance',
      columns,
      data: rows,
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-monthly.xlsx');
    res.send(buffer);
  }),

  /** report-yearly: monthly present/working + yearly totals */
  getYearlyReport: asyncHandler(async (req, res) => {
    const reg_no = Number(req.query.reg_no ?? req.params.reg_no);
    if (!Number.isFinite(reg_no)) {
      const err = new Error('reg_no is required (numeric)');
      err.statusCode = 400;
      throw err;
    }

    const from = parseDateOnly(
      req.query.from ?? req.query.start_date,
      'from'
    );
    const to = parseDateOnly(req.query.to ?? req.query.end_date, 'to');

    const studentSql = `
      SELECT
        p.reg_no,
        TRIM(CONCAT(IFNULL(p.first_name, ''), ' ', IFNULL(p.last_name, ''))) AS name,
        cm.class_name AS class,
        dm.division_name AS \`div\`,
        p.reg_no AS roll_no
      FROM par_student_personal_informations p
      LEFT JOIN class_masters cm ON cm.id = p.class
      LEFT JOIN division_masters dm ON dm.id = p.division
      WHERE p.reg_no = :reg_no
      LIMIT 1
    `;

    const [student] = await sequelize.query(studentSql, {
      replacements: { reg_no },
      type: Sequelize.QueryTypes.SELECT,
    });

    if (!student) {
      const err = new Error('Student not found');
      err.statusCode = 404;
      throw err;
    }

    const monthlySql = `
      SELECT
        DATE_FORMAT(attendance_date, '%Y-%m') AS month_key,
        DATE_FORMAT(attendance_date, '%b %Y') AS month_label,
        COUNT(*) AS working_days,
        SUM(CASE WHEN in_time IS NOT NULL AND in_time > '00:00:00' THEN 1 ELSE 0 END) AS present_days
      FROM in_out_attendances
      WHERE reg_no = :reg_no
        AND attendance_date >= :from
        AND attendance_date < DATE_ADD(:to, INTERVAL 1 DAY)
      GROUP BY DATE_FORMAT(attendance_date, '%Y-%m'), DATE_FORMAT(attendance_date, '%b %Y')
      ORDER BY month_key ASC
    `;

    const monthlyRows = await sequelize.query(monthlySql, {
      replacements: { reg_no, from, to },
      type: Sequelize.QueryTypes.SELECT,
    });

    const monthly = monthlyRows.map((m) => ({
      month: m.month_key,
      month_label: m.month_label,
      present_days: Number(m.present_days),
      working_days: Number(m.working_days),
      display: `${m.present_days}/${m.working_days}`,
    }));

    const total_present = monthly.reduce((s, m) => s + m.present_days, 0);
    const total_working_days = monthly.reduce((s, m) => s + m.working_days, 0);
    const total_absent = total_working_days - total_present;
    const present_percent =
      total_working_days > 0
        ? Math.round((total_present / total_working_days) * 10000) / 100
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        reg_no: student.reg_no,
        name: student.name,
        class: student.class,
        div: student.div,
        roll_no: student.roll_no,
        from,
        to,
        monthly,
        total_present,
        total_absent,
        total_working_days,
        present_percent,
      },
    });
  }),
};

module.exports = inOutAttendanceController;
