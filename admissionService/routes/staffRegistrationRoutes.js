const express = require('express');
const router = express.Router();
const {
  registration,
  login,
  allStaff
} = require('../controllers/staff/staffRegistrationController');

router.get('/', allStaff);
router.post('/registration', registration);
router.post('/login', login);

module.exports = router;
