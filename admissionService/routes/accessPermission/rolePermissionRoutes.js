const express = require('express');
const router = express.Router();

const rolePermissionController = require('../../controllers/accessPermission/rolePermissionController');

router.get('/:roleId', rolePermissionController.getByRole);
router.put('/:roleId', rolePermissionController.saveForRole);

module.exports = router;
