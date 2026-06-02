const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

router.post('/', batchController.create);
router.get('/', batchController.getAll);

router.get('/:batchId/relations', batchController.getBatchRelations);

module.exports = router;
