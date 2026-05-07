const express = require('express');
const router = express.Router();

const feesTypeController = require('../controllers/feesTypeController');

router.get('/', feesTypeController.getAll);
router.post('/', feesTypeController.create);

module.exports = router;

