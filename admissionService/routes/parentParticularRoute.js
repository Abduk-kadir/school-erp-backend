const express = require('express');
const router = express.Router();

const {
  createParentParticular,
  updateParentParticular,
  getParentParticularByRegNo,
} = require('../controllers/parentParticularController');

// ── Routes ─────────────────────────────
        // GET all
router.get('/:reg_no', getParentParticularByRegNo);       // GET by ID
router.post('/', createParentParticular);          // CREATE new
router.put('/:id', updateParentParticular);        // UPDATE by ID
  

module.exports = router;
