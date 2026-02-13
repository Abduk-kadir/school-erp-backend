const express = require('express');
const router = express.Router();
const StudentTransportController = require('../controllers/studentTransportController');

// List all assignments
router.get('/', StudentTransportController.getAll);

// Get one record by ID
router.get('/:id', StudentTransportController.getById);

// Get all transport assignments for one student
router.get('/student/:reg_no', StudentTransportController.getByStudent);

// Create new assignment
router.post('/', StudentTransportController.create);

// Update (mainly status, sometimes route/sub-route)
router.patch('/:id', StudentTransportController.update);

// Remove assignment
router.delete('/:id', StudentTransportController.delete);

module.exports = router;