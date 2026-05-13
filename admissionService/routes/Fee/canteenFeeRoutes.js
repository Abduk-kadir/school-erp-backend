const express = require('express');
const router = express.Router();

const canteenFeeController = require('../../controllers/Fee/canteenFeeController');

router.post('/fee-collection', canteenFeeController.createStudentFeeCollection);
router.get('/allfee-collection', canteenFeeController.getAllFees);

module.exports = router;
