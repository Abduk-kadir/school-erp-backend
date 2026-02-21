const express = require('express');
const router = express.Router();
const {
  filledFormStudensts,
  formAccepted

} = require('../controllers/admissionConformController');


         // Create
router.get('/',  filledFormStudensts); 
router.put('/updateStatus',  formAccepted);           

module.exports = router;
