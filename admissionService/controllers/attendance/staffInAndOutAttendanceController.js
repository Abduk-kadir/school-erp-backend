const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { StaffInAndOutAttendance, sequelize, Sequelize } = require('../../models');
const { generatePdf } = require('../../utils/generatePdf');
const { generateExcel } = require('../../utils/generateExcel');

function isAllFilter(value) {
  if (value === undefined || value === null || value === '') return true;
  return String(value).trim().toLowerCase() === 'all';
}

function getStaffDetailReportFilters(req) {
  const hasPaging = req.query.length !== undefined && req.query.length !== '';
  const start = parseInt(req.query.start) || 0;
  const length = hasPaging ? parseInt(req.query.length) : null;
  const filter = req.query.filter || {};
  const attendance_date =
    req.query['filter[date]'] || filter.date || req.query.date || '';
  const departmentId =
    req.query['filter[departmentId]'] ||
    req.query['filter[department]'] ||
    filter.departmentId ||
    filter.department ||
    req.query.departmentId ||
    req.query.department ||
    '';
  const designationId =
    req.query['filter[designationId]'] ||
    req.query['filter[designation]'] ||
    filter.designationId ||
    filter.designation ||
    req.query.designationId ||
    req.query.designation ||
    '';

  const whereClause = ['1 = 1'];
  const replacements = {};
  if (hasPaging) {
    replacements.length = Number.isFinite(length) && length > 0 ? length : 10;
    replacements.start = start;
  }

  if (!isAllFilter(attendance_date)) {
    whereClause.push('a.attendance_date = :attendance_date');
    replacements.attendance_date = attendance_date;
  }
  if (!isAllFilter(departmentId)) {
    whereClause.push('s.departmentid = :departmentId');
    replacements.departmentId = Number(departmentId);
  }
  if (!isAllFilter(designationId)) {
    whereClause.push('s.designationid = :designationId');
    replacements.designationId = Number(designationId);
  }

  return { whereClause, replacements, hasPaging };
}

async function getStaffDetailReportRows(req) {
  const { whereClause, replacements, hasPaging } = getStaffDetailReportFilters(req);
  const sql = `
      SELECT
        s.id AS staff_id,
        TRIM(CONCAT(IFNULL(s.firstname, ''), ' ', IFNULL(s.surname, ''))) AS name,
        dp.department_name AS department,
        dg.designation_name AS designation,
        a.attendance_date AS \`date\`,
        a.in_time,
        a.out_time
      FROM StaffRegistrations s
      LEFT JOIN departments dp ON dp.id = s.departmentid
      LEFT JOIN designations dg ON dg.id = s.designationid
      INNER JOIN staff_in_and_out_attendances a
        ON a.staff_id = s.id
      WHERE ${whereClause.join(' AND ')}
      ORDER BY s.id ASC
      ${hasPaging ? 'LIMIT :length OFFSET :start' : ''}
    `;

  return sequelize.query(sql, {
    replacements,
    type: Sequelize.QueryTypes.SELECT,
    raw: true,
  });
}

const STAFF_DETAIL_COLUMNS = ['Staff Id', 'Name', 'Department', 'Designation', 'Date', 'In Time', 'Out Time'];

function staffDetailReportCells(row) {
  const cell = (v) => (v == null ? '' : String(v));
  return [
    cell(row.staff_id),
    cell(row.name),
    cell(row.department),
    cell(row.designation),
    cell(row.date),
    cell(row.in_time),
    cell(row.out_time),
  ];
}

const staffInAndOutAttendanceController = {
  getattendancebyRegAndDate: asyncHandler(async (req, res) => {
    const staff_id = Number(req.params.id);
    const date = req.params.date;

    if (!Number.isFinite(staff_id) || !date) {
      const err = new Error('id and date are required');
      err.statusCode = 400;
      throw err;
    }

    const data = await StaffInAndOutAttendance.findOne({
      where: { staff_id, attendance_date: date },
    });

    return res.status(200).json({
      success: true,
      data,
    });
  }),

  getattendancebyRegAndMonth: asyncHandler(async (req, res) => {
    const staff_id =
      (req.user?.scope === 'staff' && Number(req.user?.id)) ||
      Number(req.params.id);
    const month = req.params.month ?? req.query.month;

    if (!Number.isFinite(staff_id) || !month) {
      const err = new Error('id and month are required');
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
    const data = await StaffInAndOutAttendance.findAll({
      where: {
        staff_id,
        attendance_date: { [Op.between]: [from, to] },
      },
      order: [['attendance_date', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      staff_id,
      month: `${year}-${mm}`,
      from,
      to,
      count: data.length,
      data,
    });
  }),

  staffgetDetailReport: asyncHandler(async (req, res) => {
    const draw = parseInt(req.query.draw) || 1;
    const data = await getStaffDetailReportRows(req);
    return res.status(200).json({ success: true, count: data.length, data, draw });
  }),

  staffDetailReportPdf: asyncHandler(async (req, res) => {
    const data = await getStaffDetailReportRows(req);
    const buffer = await generatePdf({
      title: 'Staff In-Out Attendance',
      columns: STAFF_DETAIL_COLUMNS,
      data: data.map(staffDetailReportCells),
    });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=staff-attendance.pdf');
    res.send(buffer);
  }),

  staffDetailReportExcel: asyncHandler(async (req, res) => {
    const data = await getStaffDetailReportRows(req);
    const buffer = await generateExcel({
      title: 'Staff In-Out Attendance',
      columns: STAFF_DETAIL_COLUMNS,
      data: data.map(staffDetailReportCells),
    });
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=staff-attendance.xlsx');
    res.send(buffer);
  }),
};

module.exports = staffInAndOutAttendanceController;
