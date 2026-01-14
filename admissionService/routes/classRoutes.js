const express = require('express');
const router = express.Router();
const {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass
} = require('../controllers/classController');

// CRUD routes
router.post('/', createClass);           // Create
router.get('/', getClasses);             // Get all
router.get('/:id', getClassById);        // Get one
router.put('/:id', updateClass);         // Update
router.delete('/:id', deleteClass);      // Delete

module.exports = router;
