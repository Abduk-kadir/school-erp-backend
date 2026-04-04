const express = require('express');
const router = express.Router();

const {
  getFeeRecordByRegNo,
  createFeeRecordMonthly,
  getLatestPerFeeTable
} = require('../controllers/feeRecordMonthlyController');

router.post('/', createFeeRecordMonthly);
router.get('/latest-by-table', getLatestPerFeeTable);
router.get('/reg_no/:reg_no', getFeeRecordByRegNo);

module.exports = router;
