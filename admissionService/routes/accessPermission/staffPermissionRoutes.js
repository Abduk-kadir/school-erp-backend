const express = require('express');
const router = express.Router();
const verifystaff = require('../../middlewares/verifystaff');
const checkPermission = require('../../middlewares/checkPermission');


const staffPermissionController = require('../../controllers/accessPermission/staffPermissionController');


router.get('/me', verifystaff, staffPermissionController.getMine);
router.get('/:staffId/effective', staffPermissionController.getEffective);
router.get('/:staffId', staffPermissionController.getByStaff);
router.put('/:staffId', verifystaff, checkPermission('isgivepermission','is_assign_permissions'), staffPermissionController.saveForStaff);

module.exports = router;
