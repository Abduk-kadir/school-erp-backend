const asyncHandler = require('express-async-handler');
const { InOutAttendance, sequelize, Sequelize } = require('../../models');

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








const inOutAttendanceController = {
  create: asyncHandler(async (req, res) => {
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

    const created = await InOutAttendance.bulkCreate(payload, {
      validate: true,
      ignoreDuplicates: true,
    });

    return res.status(201).json({
      success: true,
      message: 'In/out attendance created',
      count: created.length,
      data: created,
    });
  }),

  /** report-detail: reg_no, name, class, div, roll_no, date (time range) */
  getDetailReport: asyncHandler(async (req, res) => {
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const search = req.query['search[value]'] || req.query.search?.value || '';

    const attendance_date =req.query['filter[date]'] || '';
    const className = req.query['filter[className]'] || '';
    const division = req.query['filter[division]'] || '';

    const whereClause = [];
    if(className){
      whereClause.push(`p.class LIKE '%${className}%'`);
    }
    if(division){
      whereClause.push(`p.division='${division}'`)
    }
   if(attendance_date){
    whereClause.push(`a.attendance_date='${attendance_date}'`)
   }
   

   const whereSql = whereClause.length ? ` AND ${whereClause.join(' AND ')}` : '';

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
      LEFT JOIN class_masters cm ON cm.id = p.class
      LEFT JOIN division_masters dm ON dm.id = p.division
      LEFT JOIN in_out_attendances a
        ON a.reg_no = p.reg_no
      ${whereSql}
      ORDER BY p.reg_no ASC
      limit ${length} offset ${start}
    `;

    const data = await sequelize.query(sql, {
      
      type: Sequelize.QueryTypes.SELECT,
      raw: true,
    });

   

    return res.status(200).json({ success: true, count: data.length, data });
  }),

  /** report-summ: class, div, total student, present count, absent count */
  getSummaryReport: asyncHandler(async (req, res) => {
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const search = req.query['search[value]'] || req.query.search?.value || '';
    const from = req.query['filter[fromDate]'] || '2026-01-01';
    const to = req.query['filter[toDate]'] || '2026-01-01';
    const className = req.query['filter[className]'] || '';
    const division = req.query['filter[division]'] || '';

    const studentFilters = [];
    const replacements = { from, to, length, start };

    if (className) {
      studentFilters.push(`p.class LIKE :className`);
      replacements.className = `%${className}%`;
    }
    if (division) {
      studentFilters.push(`p.division = :division`);
      replacements.division = division;
    }
    

    const studentWhere = studentFilters.length
      ? ` AND ${studentFilters.join(' AND ')}`
      : '';

    const sql = `
      SELECT
        cm.class_name AS class,
        dm.division_name AS \`div\`,
        COUNT(DISTINCT p.reg_no) AS total_student,
        COUNT(DISTINCT ap.reg_no) AS present_count,
        COUNT(DISTINCT p.reg_no) - COUNT(DISTINCT ap.reg_no) AS absent_count
      FROM par_student_personal_informations p
      LEFT JOIN class_masters cm ON cm.id = p.class
      LEFT JOIN division_masters dm ON dm.id = p.division
      LEFT JOIN (
        SELECT reg_no
        FROM in_out_attendances
        WHERE attendance_date >= :from
          AND attendance_date <= :to
          AND in_time IS NOT NULL
        GROUP BY reg_no
      ) ap ON ap.reg_no = p.reg_no
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

  /** report-monthly: filter[fromDate], filter[toDate], class, division + pagination */
  getMonthlyReport: asyncHandler(async (req, res) => {
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const search = req.query['search[value]'] || req.query.search?.value || '';
    const from = req.query['filter[fromDate]'] || '2026-01-01';
    const to = req.query['filter[toDate]']||'2026-02-28';
    const className = req.query['filter[className]'] || '';
    const division = req.query['filter[division]'] || '';

    const toDateKey = (value) => {
      if (value == null) return null;
      if (typeof value === 'string') return value.slice(0, 10);
      if (value instanceof Date) {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      return String(value).slice(0, 10);
    };

    const formatTimeRange = (inTime, outTime) => {
      const fmt = (t) => {
        if (!t) return '';
        const s = String(t);
        return s.length >= 8 ? s.slice(0, 8) : s;
      };
      const inn = fmt(inTime);
      const out = fmt(outTime);
      if (inn && out) return `${inn} - ${out}`;
      if (inn) return inn;
      if (out) return out;
      return '';
    };

    const allDatesBetween = (fromStr, toStr) => {
      const dates = [];
      const [y0, m0, d0] = fromStr.split('-').map(Number);
      const [y1, m1, d1] = toStr.split('-').map(Number);
      const cur = new Date(y0, m0 - 1, d0);
      const end = new Date(y1, m1 - 1, d1);
      while (cur <= end) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, '0');
        const d = String(cur.getDate()).padStart(2, '0');
        dates.push(`${y}-${m}-${d}`);
        cur.setDate(cur.getDate() + 1);
      }
      return dates;
    };

    const rangeDates = allDatesBetween(from, to);

    const studentFilters = [];
    const replacements = { from, to, length, start };

    if (className) {
      studentFilters.push(`p.class LIKE :className`);
      replacements.className = `%${className}%`;
    }
    if (division) {
      studentFilters.push(`p.division = :division`);
      replacements.division = division;
    }
    if (search) {
      studentFilters.push(
        `(p.first_name LIKE :search OR p.last_name LIKE :search OR CAST(p.reg_no AS CHAR) LIKE :search OR cm.class_name LIKE :search OR dm.division_name LIKE :search)`
      );
      replacements.search = `%${search}%`;
    }

    const studentWhere = studentFilters.length
      ? ` AND ${studentFilters.join(' AND ')}`
      : '';

    const studentSql = `
      SELECT
        p.reg_no,
        TRIM(CONCAT(IFNULL(p.first_name, ''), ' ', IFNULL(p.last_name, ''))) AS name,
        cm.class_name AS class,
        dm.division_name AS \`div\`,
        p.reg_no AS roll_no,
        COUNT(a.attendance_date) AS total_working_days,
        SUM(CASE WHEN a.in_time IS NOT NULL THEN 1 ELSE 0 END) AS total_present,
        SUM(
          CASE WHEN a.attendance_date IS NOT NULL AND a.in_time IS NULL THEN 1 ELSE 0 END
        ) AS total_absent
      FROM par_student_personal_informations p
      LEFT JOIN class_masters cm ON cm.id = p.class
      LEFT JOIN division_masters dm ON dm.id = p.division
      LEFT JOIN in_out_attendances a
        ON a.reg_no = p.reg_no
       AND a.attendance_date >= :from
       AND a.attendance_date <= :to
      WHERE 1 = 1
      ${studentWhere}
      GROUP BY
        p.reg_no,
        p.first_name,
        p.last_name,
        cm.class_name,
        dm.division_name
      ORDER BY p.reg_no ASC
      LIMIT :length OFFSET :start
    `;

    const countStudentsSql = `
      SELECT COUNT(DISTINCT p.reg_no) AS total
      FROM par_student_personal_informations p
      LEFT JOIN class_masters cm ON cm.id = p.class
      LEFT JOIN division_masters dm ON dm.id = p.division
      WHERE 1 = 1
      ${studentWhere}
    `;

    const filterOnly = { from, to };
    if (className) filterOnly.className = replacements.className;
    if (division) filterOnly.division = replacements.division;
    if (search) filterOnly.search = replacements.search;

    const [students, [countStudentsRow]] = await Promise.all([
      sequelize.query(studentSql, {
        replacements,
        type: Sequelize.QueryTypes.SELECT,
      }),
      sequelize.query(countStudentsSql, {
        replacements: filterOnly,
        type: Sequelize.QueryTypes.SELECT,
      }),
    ]);

    const regNos = students.map((s) => s.reg_no);
    let attendanceRows = [];

    if (regNos.length > 0) {
      const attendanceSql = `
        SELECT
          a.reg_no,
          DATE_FORMAT(a.attendance_date, '%Y-%m-%d') AS attendance_date,
          a.in_time,
          a.out_time
        FROM in_out_attendances a
        INNER JOIN par_student_personal_informations p ON p.reg_no = a.reg_no
        LEFT JOIN class_masters cm ON cm.id = p.class
        LEFT JOIN division_masters dm ON dm.id = p.division
        WHERE a.attendance_date >= :from
          AND a.attendance_date <= :to
          AND a.reg_no IN (:regNos)
        ${studentWhere}
        ORDER BY a.reg_no ASC, a.attendance_date ASC
      `;

      attendanceRows = await sequelize.query(attendanceSql, {
        replacements: { ...filterOnly, regNos },
        type: Sequelize.QueryTypes.SELECT,
      });
    }

    const attendanceByRegNo = new Map();
    for (const row of attendanceRows) {
      const key = String(row.reg_no);
      if (!attendanceByRegNo.has(key)) {
        attendanceByRegNo.set(key, new Map());
      }
      const dateKey = toDateKey(row.attendance_date);
      if (dateKey) {
        attendanceByRegNo.get(key).set(dateKey, {
          in_time: row.in_time,
          out_time: row.out_time,
        });
      }
    }

    const recordsTotal = Number(countStudentsRow?.total ?? 0);

    const data = students.map((student, index) => {
      const regKey = String(student.reg_no);
      const byDate = attendanceByRegNo.get(regKey) || new Map();

      const daily = rangeDates.map((date) => {
        const att = byDate.get(date);
        if (!att) {
          return { date, status: '' };
        }
        return {
          date,
          status: formatTimeRange(att.in_time, att.out_time),
        };
      });

      const total_working_days = Number(student.total_working_days ?? 0);
      const total_present = Number(student.total_present ?? 0);
      const total_absent = Number(student.total_absent ?? 0);
      const present_percent =
        total_working_days > 0
          ? Math.round((total_present / total_working_days) * 10000) / 100
          : 0;

      return {
        srno: start + index + 1,
        reg_no: student.reg_no,
        name: student.name,
        class: student.class,
        div: student.div,
        roll_no: student.roll_no,
        daily,
        total_present,
        total_absent,
        total_working_days,
        present_percent,
      };
    });

    return res.status(200).json({
      success: true,
      draw,
      recordsTotal,
      recordsFiltered: recordsTotal,
      from,
      to,
      count: data.length,
      data,
    });
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
        SUM(CASE WHEN in_time IS NOT NULL THEN 1 ELSE 0 END) AS present_days
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
