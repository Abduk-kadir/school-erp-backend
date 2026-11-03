const express = require('express');
const router = express.Router();
const resultMarkEntryListController = require('../../controllers/examination/resultMarkEntryListController');
const  upload  = require('../../middlewares/importexcelMiddleware');
router.post('/', resultMarkEntryListController.create);
router.get('/', resultMarkEntryListController.getAll);
router.get('/:id/students', resultMarkEntryListController.getallstudentbyresultmarkentrylist);
router.post('/import-marks', upload.single('file'),resultMarkEntryListController.importMarks);

module.exports = router;
