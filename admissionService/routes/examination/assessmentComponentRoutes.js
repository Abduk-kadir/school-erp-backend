const express = require('express');
const router = express.Router();
const assessmentComponentController = require('../../controllers/examination/assessmentComponentController');

router.post('/', assessmentComponentController.create);
router.get('/', assessmentComponentController.getAll);
router.get('/:id', assessmentComponentController.getById);
router.put('/:id', assessmentComponentController.update);
router.delete('/:id', assessmentComponentController.delete);

module.exports = router;
