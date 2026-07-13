const express = require('express');
const router = express.Router();
const { uploadStaffDocument } = require('../middlewares/multerConfig');
const {
  registration,
  login,
  staffDetail,
  allStaff
} = require('../controllers/staff/staffRegistrationController');
const verifystaff = require('../middlewares/verifystaff');

router.get('/', allStaff);
router.get('/detail', verifystaff, staffDetail);
router.post(
  '/registration',
  uploadStaffDocument.fields([
    { name: 'staff_photo', maxCount: 1 },
    { name: 'staff_sig_photo', maxCount: 1 },
  ]),
  registration
);
router.post('/login', login);

module.exports = router;
