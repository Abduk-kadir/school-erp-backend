const express = require('express');
const router = express.Router();

const {
  createEducationdetail,
  updateEducationDetail,
  getEducationDetailByRegNo,
} = require('../controllers/educationalDetailController');

// ── Routes ─────────────────────────────
        // GET all
router.get('/:reg_no', getEducationDetailByRegNo);       // GET by ID
router.post('/', createEducationdetail);          // CREATE new
router.put('/:id', updateEducationDetail);        // UPDATE by ID
  

module.exports = router;
