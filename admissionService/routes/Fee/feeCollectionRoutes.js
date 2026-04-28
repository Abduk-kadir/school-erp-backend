const express = require('express');
const router = express.Router();

const feeController = require('../../controllers/Fee/feeCollectionController');
const studentFeeController = require('../../controllers/Fee/studentFeeController');

// CRUD Routes
router.post('/', feeController.createFee);
router.post('/student-fee-collection', studentFeeController.createStudentFeeCollection);
router.post('/fee-reciept-pdf', feeController.feeRecieptPDF);
router.post('/student-copy-from-personal-to-par-personal', feeController.studentCopyFromPersonalToParPersonal);
router.get('/', feeController.getAllFees);
router.get('/pdf', feeController.getAllFeesPDF);
router.get('/excel', feeController.getAllFeesInExcel);
router.get('/csv', feeController.getAllFeesInCsv);
router.get('/summary', feeController.getSummaryFeeCollection);
router.get('/registration/:reg_no', feeController.getFeeById);
router.get('/allfee/registration/:reg_no',feeController.getAllFeeById)
router.put('/:id', feeController.updateFee);
router.delete('/:id', feeController.deleteFee);

module.exports = router;