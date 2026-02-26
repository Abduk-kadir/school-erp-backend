const express = require('express');
const router = express.Router();

const { generateAdmissionPDF} = require('../controllers/pdfController');

// POST because data can be large (photos as base64, many fields)
router.post('/generate-pdf', generateAdmissionPDF);

module.exports = router;