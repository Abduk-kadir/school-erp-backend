const express = require('express');
const router = express.Router();

const staffInAndOutAttendanceController = require('../../controllers/attendance/staffInAndOutAttendanceController');

router.get('/reports/detail', staffInAndOutAttendanceController.staffgetDetailReport);
router.get('/reports/detail/pdf', staffInAndOutAttendanceController.staffDetailReportPdf);
router.get('/reports/detail/excel', staffInAndOutAttendanceController.staffDetailReportExcel);
router.get('/:id/month/:month', staffInAndOutAttendanceController.getattendancebyRegAndMonth);
router.get('/:id/:date', staffInAndOutAttendanceController.getattendancebyRegAndDate);

module.exports = router;
