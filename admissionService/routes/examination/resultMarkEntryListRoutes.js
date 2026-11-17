const express = require('express');
const router = express.Router();
const resultMarkEntryListController = require('../../controllers/examination/resultMarkEntryListController');
const  upload  = require('../../middlewares/importexcelMiddleware');
router.post('/', resultMarkEntryListController.create);
router.get('/', resultMarkEntryListController.getAll);
router.get('/:id/students', resultMarkEntryListController.getallstudentbyresultmarkentrylist);
router.get('/:id/co-scholastic-students', resultMarkEntryListController.getallco_scholasticstudentbyresultmarkentrylist);
router.post('/import-marks', upload.single('file'),resultMarkEntryListController.importMarks);

router.post('/generate-result', resultMarkEntryListController.generateresult);
router.post('/generate-result-pdf', resultMarkEntryListController.generateResultPdf);

module.exports = router;
