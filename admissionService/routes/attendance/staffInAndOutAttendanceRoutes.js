const express = require('express');
const router = express.Router();

const staffInAndOutAttendanceController = require('../../controllers/attendance/staffInAndOutAttendanceController');

router.get('/:id/month/:month', staffInAndOutAttendanceController.getattendancebyRegAndMonth);
router.get('/:id/:date', staffInAndOutAttendanceController.getattendancebyRegAndDate);

module.exports = router;
