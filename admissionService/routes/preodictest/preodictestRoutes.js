const express = require('express');
const router = express.Router();
const preodictestController = require('../../controllers/preodictest/preodictestController');

router.post('/', preodictestController.create);
router.get('/', preodictestController.getAll);
router.get('/:id', preodictestController.getById);
router.delete('/:id', preodictestController.delete);

module.exports = router;
