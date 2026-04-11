const express = require('express');
const router = express.Router();

const {
  getFeeRecordByRegNo,
  createFeeRecordMonthly,
  getLatestPerFeeTable,
  getLatestFeeExcel,
  getLatestFeeCSV
} = require('../controllers/feeRecordMonthlyController');

router.post('/', createFeeRecordMonthly);
router.get('/latest-by-table', getLatestPerFeeTable);
router.get('/reg_no/:reg_no', getFeeRecordByRegNo);
router.get('/latest-fee-excel',getLatestFeeExcel);
router.get('/latest-fee-csv',getLatestFeeCSV);
module.exports = router;
