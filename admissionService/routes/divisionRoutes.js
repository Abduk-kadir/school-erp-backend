const express = require('express');
const router = express.Router();
const {
  createDivision,
  getDivisions,
  getDivisionById,
  updateDivision,
  deleteDivision
} = require('../controllers/divisioncontroller');

// CRUD routes
router.post('/', createDivision);           // Create
router.get('/', getDivisions);             // Get all
router.get('/:id', getDivisionById);       // Get one
router.put('/:id', updateDivision);        // Update
router.delete('/:id', deleteDivision);     // Delete

module.exports = router;
