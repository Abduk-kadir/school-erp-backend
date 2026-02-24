const express = require('express');
const router = express.Router();
const {
  filledFormStudensts,
  formAccepted,
  editByStudent

} = require('../controllers/admissionConformController');


         // Create
router.get('/',  filledFormStudensts); 
router.put('/updateStatus',  formAccepted);  
router.put('/editbystudent',  editByStudent);           

module.exports = router;
