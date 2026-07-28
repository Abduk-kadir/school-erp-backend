const express = require('express');
const router = express.Router();
const { saveattendancebyrfid } = require('../controllers/rfid/rfidController');

router.get('/saveattendancebyrfid', saveattendancebyrfid);

module.exports = router;
