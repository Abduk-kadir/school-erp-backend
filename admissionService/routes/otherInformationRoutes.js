const express = require('express');
const router = express.Router();
const {
  createOtherInformation,
  updateOtherInformation,
  getOtherInformationByRegNo,
  getAllOtherInformation,
} = require('../controllers/otherinformationController');

// Optional: add auth middleware later
// const { auth, adminOnly } = require('../middleware/auth');

router
  .route('/')
  .post(createOtherInformation)          // CREATE
  .get(getAllOtherInformation);          // LIST (paginated)

router
  .route('/:reg_no')
  .get(getOtherInformationByRegNo)       // GET ONE
  .patch(updateOtherInformation);        // UPDATE (partial update)

// If you also want full replace → you can add .put() later

module.exports = router;