const express = require('express');
const router = express.Router();

const {
  getAllDisabilities,
  getDisabilityById,
  createDisability,
  updateDisability,
  deleteDisability,
} = require('../controllers/physicallyDisaleController');

// ── Routes ─────────────────────────────
router.get('/', getAllDisabilities);          // GET all
router.get('/:id', getDisabilityById);       // GET by ID
router.post('/', createDisability);          // CREATE new
router.put('/:id', updateDisability);        // UPDATE by ID
router.delete('/:id', deleteDisability);     // DELETE by ID

module.exports = router;
