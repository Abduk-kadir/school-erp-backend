const express = require('express');
const verifystaff = require('../middlewares/verifystaff');
const checkPermission = require('../middlewares/checkPermission');
const router = express.Router();
const {
  createCaste,
  getCastes,
  getCasteById,
  updateCaste,
  deleteCaste
} = require('../controllers/casteController');

// CRUD routes
router.post('/', verifystaff, checkPermission('caste','add'), createCaste);           // Create
router.get('/', getCastes);             // Get all
router.get('/:id', getCasteById);       // Get one
router.put('/:id', updateCaste);        // Update
router.delete('/:id',verifystaff,checkPermission('caste','delete'), deleteCaste);     // Delete

module.exports = router;
