const express = require('express');
const router = express.Router();
const descriptiveRemarkController = require('../../controllers/examination/descriptiveRemarkController');

router.post('/', descriptiveRemarkController.create);
router.get('/', descriptiveRemarkController.getAll);
router.delete('/:id', descriptiveRemarkController.delete);

module.exports = router;
