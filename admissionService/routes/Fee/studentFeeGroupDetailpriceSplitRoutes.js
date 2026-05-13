const express = require('express');
const router = express.Router();

const studentFeeGroupDetailpriceSplitController = require('../../controllers/Fee/studentFeeGroupDetailpriceSplitController');

// bulk create
router.post('/', studentFeeGroupDetailpriceSplitController.create);

// latest split row per installment for a student (reg_no on studentfeegroupdetailprices)
router.get('/:reg_no/feefor/:fee_for', studentFeeGroupDetailpriceSplitController.getAll);

module.exports = router;

