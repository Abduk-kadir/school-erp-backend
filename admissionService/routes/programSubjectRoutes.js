const express = require('express');
const router = express.Router();

const {
  getAllProgramSubjects,
  getSubjectsByClassAndSemester,
  getProgramSubjectById,
  createProgramSubject,
  updateProgramSubject,
  deleteProgramSubject,
  bulkCreateProgramSubjects
} = require('../controllers/programSubjectController');

// Routes
router.get('/', getAllProgramSubjects);
router.get('/class/:classId/semester/:semester', getSubjectsByClassAndSemester);
router.get('/:id', getProgramSubjectById);
router.post('/', createProgramSubject);
router.put('/:id', updateProgramSubject);
router.delete('/:id', deleteProgramSubject);
router.post('/bulk', bulkCreateProgramSubjects);

module.exports = router;