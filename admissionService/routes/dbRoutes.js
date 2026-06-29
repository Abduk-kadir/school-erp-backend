// routes/yearRoutes.js
const express = require('express');
const router = express.Router();
const { switchYear, getCurrentYear } = require('../controllers/dbController');

// Switch academic year
router.post('/switch', switchYear);

// Get current year
router.get('/current', getCurrentYear);

module.exports = router;