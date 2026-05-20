const express = require('express');
const router = express.Router();

const paymentSettingController = require('../../../controllers/Fee/Bank/paymentSettingController');

router.get('/', paymentSettingController.getAll);
router.post('/', paymentSettingController.create);
router.delete('/:id', paymentSettingController.delete);

module.exports = router;
