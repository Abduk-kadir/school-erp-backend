const express = require('express');
const router = express.Router();
const DocumentTypeController = require('../controllers/documentTypeController');

// List all document types (with filters & pagination)
router.get('/', DocumentTypeController.getAll);

// Get single document type
router.get('/:id', DocumentTypeController.getById);

// Create new document type
router.post('/', DocumentTypeController.create);

// Update document type
router.put('/:id', DocumentTypeController.update);

// Delete document type
router.delete('/:id', DocumentTypeController.delete);

module.exports = router;