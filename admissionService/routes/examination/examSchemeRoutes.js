const express = require('express');
const router = express.Router();
const examSchemeController = require('../../controllers/examination/examSchemeController');

router.post('/', examSchemeController.create);
router.get('/', examSchemeController.getAll);
router.get('/exam-name/:examNameId', examSchemeController.getByExamNameId);
router.get(
  '/exam-name/:examNameId/class/:classId/term/:termId',
  examSchemeController.getExamSchemeByExamNameClassTerm
);router.get('/:id', examSchemeController.getById);
router.put('/:id', examSchemeController.update);
router.delete('/:id', examSchemeController.delete);

module.exports = router;
