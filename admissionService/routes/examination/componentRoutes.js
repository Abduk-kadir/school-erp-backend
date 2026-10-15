const express = require('express');
const router = express.Router();
const componentController = require('../../controllers/examination/componentController');

router.post('/', componentController.create);
router.get('/', componentController.getAll);
router.get('/:id', componentController.getById);
router.put('/:id', componentController.update);
router.delete('/:id', componentController.delete);

module.exports = router;
