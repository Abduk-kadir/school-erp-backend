// routes/bankDetails.js
const express = require('express');
const router = express.Router();
const bankDetailsController = require('../../../controllers/Fee/Bank/bankDetailController');

router.get('/', bankDetailsController.getMyBankDetails);
router.post('/', bankDetailsController.createBankDetail);
router.delete('/:id', bankDetailsController.deleteBankDetail);

module.exports = router;