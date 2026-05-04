const express = require('express');
const router = express.Router();
const adminDashBoardController = require('../controllers/adminDashBoard/adminDashBoardController');

router.get('/total-student', adminDashBoardController.totalStudent);
router.get('/total-fee-collected', adminDashBoardController.totalFeeCollected);

module.exports = router;
