const express = require('express');
const router = express.Router();

const feeHeadController = require('../../../controllers/Fee/Bank/feeheadController');

// List all fee heads
router.get('/', feeHeadController.getAllFeeHeads);

// Get single fee head
router.get('/:id', feeHeadController.getFeeHeadById);

// Create new fee head
router.post('/', feeHeadController.createFeeHead);

// Update fee head
router.put('/:id', feeHeadController.updateFeeHead);

// Delete fee head
router.delete('/:id', feeHeadController.deleteFeeHead);

module.exports = router;