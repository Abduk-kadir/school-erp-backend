const express = require('express');
const router = express.Router();
const designationController = require('../controllers/designationController');

router.post('/', designationController.create);
router.get('/', designationController.getAll);
router.delete('/:id', designationController.delete);

module.exports = router;
