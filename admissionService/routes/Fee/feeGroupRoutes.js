const express = require('express');
const router = express.Router();

const feeGroupController = require('../../controllers/Fee/feeGroupController');

router.get('/', feeGroupController.getAllFeeGroups);
router.post('/groupdetailandpricing', feeGroupController.creategroupDetailAndPricing);
router.get(
  '/student/:regNo/assigned-fees',
  feeGroupController.getfeeAssignedToStudent
);
router.post('/assign-fee-to-student', feeGroupController.assignFeeToStudent);

router.get('/:id', feeGroupController.getFeeGroupById);
router.post('/', feeGroupController.createFeeGroup);
router.put('/:id', feeGroupController.updateFeeGroup);
router.delete('/:id', feeGroupController.deleteFeeGroup);

module.exports = router;
