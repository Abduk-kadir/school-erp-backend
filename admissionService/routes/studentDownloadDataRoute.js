const express = require('express');
const router = express.Router();
const {
 allColumnOfTable, exportAllStudentData
} = require('../controllers/downloadStudentDataController');


router.get('/allcolumn', allColumnOfTable); 
router.post('/', exportAllStudentData);             // Get all


module.exports = router;
