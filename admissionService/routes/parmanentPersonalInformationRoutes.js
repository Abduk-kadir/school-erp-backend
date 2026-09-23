const express = require('express');
const router = express.Router();
const ParmanentPersonalInformation = require('../controllers/parmanentPersonalInformationController');
const { uploadStudentPhotoAndSignature } = require('../middlewares/multerConfig');

router.post('/', ParmanentPersonalInformation.create);
router.get('/', ParmanentPersonalInformation.getAll);
router.get('/columns', ParmanentPersonalInformation.getAllColumns);
router.put('/bulk-update', ParmanentPersonalInformation.bulkUpdatePersonalInformation);
router.post(
  '/photos',
  uploadStudentPhotoAndSignature.fields([{ name: 'photos', maxCount: 500 }]),
  ParmanentPersonalInformation.uploadStudentPhotoAndSignature
);
router.get('/reg/:reg_no', ParmanentPersonalInformation.getByReg);
router.get('/email/:email',ParmanentPersonalInformation.getByEmail);
router.get('/email/:email/password/:password', ParmanentPersonalInformation.getAllByEmailAndPassword);
router.post('/login',ParmanentPersonalInformation.login);
router.post('/logout', ParmanentPersonalInformation.logout);
router.put('/:id', ParmanentPersonalInformation.update);
router.delete('/:id', ParmanentPersonalInformation.remove);

module.exports = router;
