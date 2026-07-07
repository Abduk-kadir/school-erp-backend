const express = require('express');
const router = express.Router();
const classDivMapMasterController = require('../controllers/classDivMapMasterController');

router.post('/', classDivMapMasterController.create);
router.get('/', classDivMapMasterController.getAll);
router.delete('/:id', classDivMapMasterController.delete);

module.exports = router;
