const express = require('express');
const router = express.Router();

const studentfineController = require('../../controllers/Fee/studentfineController');

router.get('/', studentfineController.getAll);
router.get('/:id', studentfineController.getById);
router.post('/', studentfineController.create);
router.put('/:id', studentfineController.update);
router.delete('/:id', studentfineController.remove);

module.exports = router;
