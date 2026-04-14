const express = require('express');
const router = express.Router();

const feeController = require('../../controllers/Fee/feeCollectionController');

// CRUD Routes
router.post('/', feeController.createFee);
router.post('/fee-reciept-pdf', feeController.feeRecieptPDF);
router.get('/', feeController.getAllFees);
router.get('/pdf', feeController.getAllFeesPDF);
router.get('/excel', feeController.getAllFeesInExcel);
router.get('/csv', feeController.getAllFeesInCsv);
router.get('/summary', feeController.getSummaryFeeCollection);
router.get('/registration/:reg_no', feeController.getFeeById);
router.put('/:id', feeController.updateFee);
router.delete('/:id', feeController.deleteFee);

module.exports = router;