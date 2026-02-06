
const express = require('express');
const router = express.Router();
const { uploadInstituteLogo } = require('../middlewares/multerConfig');
const instituteController = require('../controllers/instituteController');

router.post(
  '/',
  uploadInstituteLogo.single('logo'),   // ← field name = 'logo'
  instituteController.create
);
router.get(
  '/',
   
  instituteController.getAll
);

router.patch(
  '/:id',
  uploadInstituteLogo.single('logo'),
  instituteController.update
);

module.exports = router;

