const express = require('express');
const router = express.Router();
const StudentDocumentController = require('../controllers/studentDocumentController');
const upload = require('../middlewares/upload');

// List documents for a student
router.get('/student/:reg_number', StudentDocumentController.getByStudent);

// Get single document
router.get('/:id', StudentDocumentController.getById);

// Upload document (multipart/form-data)
router.post(
  '/upload',
  upload.single('document'), // 'document' is the field name in form
  StudentDocumentController.upload
);
router.put('/:id', upload.single('document'), StudentDocumentController.update);

// Delete document
router.delete('/:id', StudentDocumentController.delete);

module.exports = router;