const express = require('express');
const router = express.Router();

const moduleController = require('../../controllers/accessPermission/moduleController');

router.post('/', moduleController.create);
router.get('/', moduleController.getAll);
router.put('/:id', moduleController.update);
router.delete('/:id', moduleController.delete);

module.exports = router;
