const express = require('express');
const router = express.Router();

const staffPermissionController = require('../../controllers/accessPermission/staffPermissionController');

router.get('/:staffId/effective', staffPermissionController.getEffective);
router.get('/:staffId', staffPermissionController.getByStaff);
router.put('/:staffId', staffPermissionController.saveForStaff);

module.exports = router;
