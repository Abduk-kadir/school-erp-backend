const express = require('express');
const router = express.Router();

const feeController = require('../../controllers/Fee/feeCollectionController');

// CRUD Routes
router.post('/', feeController.createFee);
router.get('/', feeController.getAllFees);
router.get('/summary', feeController.getSummaryFeeCollection);
router.get('/registration/:reg_no', feeController.getFeeById);
router.put('/:id', feeController.updateFee);
router.delete('/:id', feeController.deleteFee);

module.exports = router;