const express = require('express');
const router = express.Router();
const termController = require('../../controllers/examination/termController');

router.post('/', termController.create);
router.get('/', termController.getAll);
router.get('/:id', termController.getById);
router.put('/:id', termController.update);
router.delete('/:id', termController.delete);

module.exports = router;
