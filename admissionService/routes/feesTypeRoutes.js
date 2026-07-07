const express = require('express');
const router = express.Router();

const feesTypeController = require('../controllers/feesTypeController');

router.get('/', feesTypeController.getAll);
router.post('/', feesTypeController.create);
router.delete('/:id', feesTypeController.delete);

module.exports = router;

