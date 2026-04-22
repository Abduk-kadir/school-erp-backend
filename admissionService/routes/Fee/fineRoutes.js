const express = require('express');
const router = express.Router();

const fineController = require('../../controllers/Fee/fineController');

router.get('/', fineController.getAllFines);
router.get('/:id', fineController.getFineById);
router.post('/', fineController.createFine);
router.put('/:id', fineController.updateFine);
router.delete('/:id', fineController.deleteFine);
router.post('/calculate-fine', fineController.calculateFine);

module.exports = router;
