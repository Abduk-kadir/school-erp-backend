const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

router.post('/', roleController.createRole);       // Create role
router.get('/', roleController.getRoles);          // Get all roles
router.get('/:id', roleController.getRoleById);    // Get role by ID
router.put('/:id', roleController.updateRole);     // Update role by ID
router.delete('/:id', roleController.deleteRole);  // Delete role by ID

module.exports = router;
