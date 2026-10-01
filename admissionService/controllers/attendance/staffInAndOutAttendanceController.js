const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { StaffInAndOutAttendance } = require('../../models');

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
};

module.exports = staffInAndOutAttendanceController;
