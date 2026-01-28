const express = require('express');
const router = express.Router();

const {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectByCode
} = require('../controllers/subjectController'); // adjust path

// Routes
router.get('/', getAllSubjects);
router.get('/:id', getSubjectById);
router.get('/code/:code', getSubjectByCode);

router.post('/', createSubject);
router.put('/:id', updateSubject);
router.delete('/:id', deleteSubject);

module.exports = router;