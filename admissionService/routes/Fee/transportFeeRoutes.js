const express = require('express');
const router = express.Router();

const transportFeeController = require('../../controllers/Fee/transportFeeController');

router.post('/fee-collection', transportFeeController.createStudentFeeCollection);

module.exports = router;
