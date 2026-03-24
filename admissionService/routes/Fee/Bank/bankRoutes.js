
const express = require('express');
const router = express.Router();

const banksController = require('../../../controllers/Fee/Bank/BankController');


router.get('/', banksController.getActiveBanks);



router.get('/all', banksController.getAllBanks);
router.post('/', banksController.createBank);
router.patch('/:id', banksController.updateBank);
// Optional: router.delete('/:id', ...) → usually not recommended for master data

module.exports = router;