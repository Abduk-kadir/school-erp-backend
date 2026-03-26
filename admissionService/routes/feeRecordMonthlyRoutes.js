const express = require('express');
const router = express.Router();

const { getFeeRecordByRegNo } = require('../controllers/feeRecordMonthlyController');

router.get('/reg_no/:reg_no', getFeeRecordByRegNo);

module.exports = router;
