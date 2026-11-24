const express = require('express');
const router = express.Router();
const { saveattendancebyrfid,allfridExcelDownload,allunknownexcelDownload,notmatchedexcelDownload } = require('../controllers/rfid/rfidController');

router.get('/saveattendancebyrfid', saveattendancebyrfid);
router.get('/allfridExcelDownload', allfridExcelDownload);
router.get('/allunknownexcelDownload', allunknownexcelDownload);
router.get('/notmatchedexcelDownload', notmatchedexcelDownload);
module.exports = router;
