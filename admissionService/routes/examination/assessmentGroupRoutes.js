const express = require('express');
const router = express.Router();
const assessmentGroupController = require('../../controllers/examination/assessmentGroupController');

router.post('/', assessmentGroupController.create);
router.get('/', assessmentGroupController.getAll);
router.get('/:id', assessmentGroupController.getById);
router.put('/:id', assessmentGroupController.update);
router.delete('/:id', assessmentGroupController.delete);

module.exports = router;
