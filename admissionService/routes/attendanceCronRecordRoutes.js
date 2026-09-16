const express = require('express');
const router = express.Router();
const attendanceCronRecordController = require('../controllers/rfid/attendanceCronRecordController');

router.post('/', attendanceCronRecordController.create);
router.get('/', attendanceCronRecordController.getAll);
router.delete('/:id', attendanceCronRecordController.delete);

module.exports = router;
