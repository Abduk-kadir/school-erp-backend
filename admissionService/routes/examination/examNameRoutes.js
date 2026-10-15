const express = require('express');
const router = express.Router();
const examNameController = require('../../controllers/examination/examNameController');

router.post('/', examNameController.create);
router.get('/', examNameController.getAll);
router.get('/:id', examNameController.getById);
router.put('/:id', examNameController.update);
router.delete('/:id', examNameController.delete);

module.exports = router;
