const express = require('express');
const router = express.Router();
const gradeScaleController = require('../../controllers/examination/gradeScaleController');

router.post('/', gradeScaleController.create);
router.get('/', gradeScaleController.getAll);
router.get('/:id', gradeScaleController.getById);
router.put('/:id', gradeScaleController.update);
router.delete('/:id', gradeScaleController.delete);

module.exports = router;
