const express = require('express');
const router = express.Router();

const {
  getAllProgramSubjects,
  getSubjectsByClassAndSemester,
  getProgramSubjectById,
  createProgramSubject,
  updateProgramSubject,
  deleteProgramSubject,
  bulkCreateProgramSubjects,
  getAllProgramSubjectsByClassAndSemester
} = require('../controllers/programSubjectController');

// Routes
router.get('/', getAllProgramSubjects);

//router.get('/:id', getProgramSubjectById);
router.post('/', createProgramSubject);
//router.put('/:id', updateProgramSubject);
//router.delete('/:id', deleteProgramSubject);
router.post('/bulk', bulkCreateProgramSubjects);
router.get('/byclasssemester', getAllProgramSubjectsByClassAndSemester);

module.exports = router;