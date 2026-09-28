const express = require('express');
const router = express.Router();
const studentDashboard = require('../../controllers/studentDashboard/studentDashboard');

router.get('/:reg_no', studentDashboard.getStats);

module.exports = router;
