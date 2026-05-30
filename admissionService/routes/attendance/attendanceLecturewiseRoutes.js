const express = require('express');
const router = express.Router();

const attendanceLecturewiseController = require('../../controllers/attendance/attendanceLecturewiseController');

router.post('/', attendanceLecturewiseController.create);
router.get('/get-student', attendanceLecturewiseController.getstudentLecturewise);

module.exports = router;
