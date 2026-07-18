const express = require('express');
const router = express.Router();
const titleController = require('../controllers/titleController');

router.post('/', titleController.create);
router.get('/', titleController.getAll);
router.put('/:id', titleController.update);
router.delete('/:id', titleController.delete);

module.exports = router;
