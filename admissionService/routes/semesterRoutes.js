const express = require('express');
const router = express.Router();
const semesterController = require('../controllers/semesterController');

router.post('/', semesterController.create);
router.get('/', semesterController.getAll);
router.delete('/:id', semesterController.delete);

module.exports = router;
