
const express = require('express');
const router = express.Router();
const { uploadClasswiseInstituteLogo } = require('../middlewares/multerConfig');
const instituteController = require('../controllers/classwiseSchoolController');

router.post(
  '/',
  uploadClasswiseInstituteLogo.single('logo'),   // ← field name = 'logo'
  instituteController.bulkCreate
);
router.get(
  '/',
   
  instituteController.getAll
);

router.patch(
  '/:id',
 uploadClasswiseInstituteLogo.single('logo'),
  instituteController.update
);

module.exports = router;

