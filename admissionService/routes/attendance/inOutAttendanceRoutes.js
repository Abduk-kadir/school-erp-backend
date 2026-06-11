const express = require('express');
const router = express.Router();

const inOutAttendanceController = require('../../controllers/attendance/inOutAttendanceController');

router.post('/', inOutAttendanceController.create);
router.get('/reports/detail', inOutAttendanceController.getDetailReport);
router.get('/reports/summary', inOutAttendanceController.getSummaryReport);
router.get('/reports/monthly', inOutAttendanceController.getMonthlyReport);
router.get('/reports/yearly', inOutAttendanceController.getYearlyReport);
router.get('/:reg_no/month/:month', inOutAttendanceController.getattendancebyRegAndMonth);
router.get('/:reg_no/:date', inOutAttendanceController.getattendancebyRegAndDate);

module.exports = router;
