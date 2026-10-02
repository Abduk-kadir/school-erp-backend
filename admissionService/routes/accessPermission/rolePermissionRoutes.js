const express = require('express');
const router = express.Router();
const verifystaff = require('../../middlewares/verifystaff');
const checkPermission = require('../../middlewares/checkPermission');

const rolePermissionController = require('../../controllers/accessPermission/rolePermissionController');

router.get('/:roleId', rolePermissionController.getByRole);
router.put('/:roleId', verifystaff, checkPermission('isgivepermission','is_assign_permissions'), rolePermissionController.saveForRole);

module.exports = router;
