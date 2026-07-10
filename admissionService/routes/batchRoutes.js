const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

router.post('/', batchController.create);
router.get('/', batchController.getAll);
router.delete('/:id', batchController.delete);

router.get('/:batchId/relations', batchController.getBatchRelations);

router.get('/student/:reg_no', batchController.getBachByStudentId);

module.exports = router;
