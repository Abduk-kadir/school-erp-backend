const express = require('express');
const router = express.Router();
const staffclassmapController = require('../controllers/staffclassmapController');

router.post('/', staffclassmapController.create);
router.get('/', staffclassmapController.getAll);
router.put('/:id', staffclassmapController.edit);
router.delete('/:id', staffclassmapController.delete);

module.exports = router;
