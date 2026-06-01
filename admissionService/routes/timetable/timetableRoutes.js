const express = require('express');
const router = express.Router();
const { uploadTimetable } = require('../../middlewares/multerConfig');
const timetableController = require('../../controllers/timetable/timetableController');

router.post('/', uploadTimetable.single('timetable'), timetableController.create);
router.get('/', timetableController.getAll);

module.exports = router;
