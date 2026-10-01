const express = require('express');
const router = express.Router();

const roleController = require('../../controllers/accessPermission/roleController');

router.post('/', roleController.create);
router.get('/', roleController.getAll);
router.put('/:id/assign', roleController.assignToStaff);
router.get('/:id', roleController.getById);
router.put('/:id', roleController.update);
router.delete('/:id', roleController.delete);

module.exports = router;
