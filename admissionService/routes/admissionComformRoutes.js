const express = require('express');
const router = express.Router();
const {
  filledFormStudensts

} = require('../controllers/admissionConformController');


         // Create
router.get('/',  filledFormStudensts);           

module.exports = router;
