const express = require('express');
const router = express.Router();

const studentFeeController = require('../../controllers/Fee/studentFeeController');

// Create one FeeCollection + bulk FeeRecordMonthly + update StudentFeeGroupDetailPrice
router.post('/fee-collection', studentFeeController.createStudentFeeCollection);

module.exports = router;

