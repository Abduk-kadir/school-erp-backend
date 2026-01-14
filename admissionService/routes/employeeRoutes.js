const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');

// CRUD routes
router.post('/', createEmployee);           // Create
router.get('/', getEmployees);              // Get all
router.get('/:id', getEmployeeById);        // Get one
router.put('/:id', updateEmployee);         // Update
router.delete('/:id', deleteEmployee);      // Delete

module.exports = router;
