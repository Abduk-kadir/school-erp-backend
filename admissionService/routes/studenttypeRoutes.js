const express = require('express');
const router = express.Router();
const studenttypeController = require('../controllers/studenttypeController');

router.post('/', studenttypeController.create);
router.get('/', studenttypeController.getAll);
router.delete('/:id', studenttypeController.delete);

module.exports = router;
