const express = require('express');
const router = express.Router();
const { uploadNotes } = require('../../middlewares/multerConfig');
const notesController = require('../../controllers/notes/notesController');

router.post('/', uploadNotes.single('notes'), notesController.create);
router.get('/student/:reg_no', notesController.getNotesStudent);
router.get('/pdf', notesController.notesPdf);
router.get('/excel', notesController.notesExcel);
router.get('/', notesController.getAll);

module.exports = router;
