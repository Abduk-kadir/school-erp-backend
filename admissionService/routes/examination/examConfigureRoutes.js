const express = require('express');
const router = express.Router();
const examConfigureController = require('../../controllers/examination/examConfigureController');

router.post('/', examConfigureController.create);
router.get('/', examConfigureController.getAll);
router.get('/exam/:examId', examConfigureController.getByExamId);
router.get('/:id', examConfigureController.getById);
router.put('/:id', examConfigureController.update);
router.delete('/:id', examConfigureController.delete);

module.exports = router;
