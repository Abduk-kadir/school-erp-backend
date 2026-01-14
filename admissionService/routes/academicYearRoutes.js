const express = require('express');
const router = express.Router();
const {
  createAcademicYear,
  getAcademicYears,
  getAcademicYearById,
  updateAcademicYear,
  deleteAcademicYear
} = require('../controllers/academicYearController');

// CRUD routes
router.post('/', createAcademicYear);           // Create
router.get('/', getAcademicYears);             // Get all
router.get('/:id', getAcademicYearById);       // Get one
router.put('/:id', updateAcademicYear);        // Update
router.delete('/:id', deleteAcademicYear);     // Delete

module.exports = router;
