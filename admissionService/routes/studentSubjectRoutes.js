const express = require('express');
const router = express.Router();

const {
  getAllStudentSubjects,
  getStudentSubjects,
  createStudentSubject,
  bulkCreateStudentSubjects,
  bulkUpdateStudentSubjects,
  updateStudentSubject,
  deleteStudentSubject,
  getAllStudentSubjectsbyregids
  
} = require('../controllers/studentSubjectController');

// Routes
router.get('/', getAllStudentSubjects);                  // GET all assignments
router.get('/student/:student_reg_no', getStudentSubjects);  // GET all subjects for one student
//router.post('/', createStudentSubject);                  // Create single assignment
router.post('/bulk', bulkCreateStudentSubjects);
router.put('/bulk', bulkUpdateStudentSubjects);
         
//router.put('/:id', updateStudentSubject);                // Update one assignment
//router.delete('/:id', deleteStudentSubject);   
router.post('/regids', getAllStudentSubjectsbyregids);           // Delete one assignment

module.exports = router;