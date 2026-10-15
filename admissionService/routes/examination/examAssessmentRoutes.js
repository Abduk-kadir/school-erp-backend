const express = require('express');
const router = express.Router();
const examAssessmentController = require('../../controllers/examination/examAssessmentController');

router.post('/', examAssessmentController.create);
router.get('/', examAssessmentController.getAll);
router.get('/scheme/:examSchemeId', examAssessmentController.getByExamSchemeId);
router.get('/:id', examAssessmentController.getById);
router.put('/:id', examAssessmentController.update);
router.delete('/:id', examAssessmentController.delete);

module.exports = router;
