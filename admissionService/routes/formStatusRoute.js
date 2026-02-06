const express = require('express');
const router = express.Router();
const formStatusController = require('../controllers/formStatusController');

router.post('/upsert', formStatusController.upsert);
router.get('/:reg_no', formStatusController.getByRegNo);
router.get('/', formStatusController.getAll);           // optional - admin only

module.exports = router;