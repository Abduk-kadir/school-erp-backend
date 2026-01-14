const express = require('express');
const router = express.Router();
const {
  createCaste,
  getCastes,
  getCasteById,
  updateCaste,
  deleteCaste
} = require('../controllers/casteController');

// CRUD routes
router.post('/', createCaste);           // Create
router.get('/', getCastes);             // Get all
router.get('/:id', getCasteById);       // Get one
router.put('/:id', updateCaste);        // Update
router.delete('/:id', deleteCaste);     // Delete

module.exports = router;
