const express = require('express');
const router = express.Router();

const fineAssignedController = require('../../controllers/Fee/fineAssignedController');

router.get('/', fineAssignedController.getAllFineAssigned);
router.get('/:id', fineAssignedController.getFineAssignedById);
router.post('/', fineAssignedController.createFineAssigned);
router.put('/:id', fineAssignedController.updateFineAssigned);
router.delete('/:id', fineAssignedController.deleteFineAssigned);

module.exports = router;
