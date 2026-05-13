const express = require('express');
const router = express.Router();

const admissionFeeController = require('../../controllers/Fee/admissionFeeController');
const { route } = require('./canteenFeeRoutes');

router.post('/fee-collection', admissionFeeController.createStudentFeeCollection);
router.get('/allfee-collection', admissionFeeController.getAllFees);

module.exports = router;
