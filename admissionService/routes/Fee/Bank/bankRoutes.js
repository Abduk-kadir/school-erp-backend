
const express = require('express');
const router = express.Router();

const banksController = require('../../../controllers/Fee/Bank/BankController');


router.get('/', banksController.getActiveBanks);



router.get('/all', banksController.getAllBanks);
router.post('/', banksController.createBank);
router.patch('/:id', banksController.updateBank);
router.delete('/:id', banksController.deleteBank);

module.exports = router;