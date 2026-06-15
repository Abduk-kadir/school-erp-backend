const express = require('express');
const router = express.Router();

const holidarmasterController = require('../../controllers/holidarmaster/holidarmasterController');

router.post('/', holidarmasterController.create);
router.get('/student/:reg_no', holidarmasterController.getHolidayMasterStudent);
router.get('/', holidarmasterController.getAll);
module.exports = router;
