const express = require('express');
const router = express.Router();
const {
  registration,
  login,
  staffDetail,
  allStaff
} = require('../controllers/staff/staffRegistrationController');
const verifystaff = require('../middlewares/verifystaff');

router.get('/', allStaff);
router.get('/detail', verifystaff, staffDetail);
router.post('/registration', registration);
router.post('/login', login);

module.exports = router;
