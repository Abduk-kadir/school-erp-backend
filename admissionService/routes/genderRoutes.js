const express = require('express');
const router = express.Router();
const genderController = require('../controllers/genderController');

router.post('/', genderController.create);
router.get('/', genderController.getAll);
router.put('/:id', genderController.update);
router.delete('/:id', genderController.delete);

module.exports = router;
