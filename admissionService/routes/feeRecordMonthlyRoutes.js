const express = require('express');
const router = express.Router();

const {
  getFeeRecordByRegNo,
  createFeeRecordMonthly,
  getLatestPerFeeTable,
  getLatestFeeExcel,
  getLatestFeeCSV,
  getLatestFeePDF
} = require('../controllers/feeRecordMonthlyController');

router.post('/', createFeeRecordMonthly);
router.get('/latest-by-table', getLatestPerFeeTable);
router.get('/reg_no/:reg_no', getFeeRecordByRegNo);
router.get('/latest-fee-excel',getLatestFeeExcel);
router.get('/latest-fee-csv',getLatestFeeCSV);
router.get('/latest-fee-pdf',getLatestFeePDF);

module.exports = router;
