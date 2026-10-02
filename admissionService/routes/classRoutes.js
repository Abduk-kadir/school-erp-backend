const express = require('express');
const router = express.Router();
const verifystaff = require('../middlewares/verifystaff');
const checkPermission = require('../middlewares/checkPermission');
const {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass
} = require('../controllers/classController');

// CRUD routes
router.post('/', verifystaff, checkPermission('class','add'),createClass);           // Create
router.get('/', getClasses);             // Get all
router.get('/:id', getClassById);        // Get one
router.put('/:id', updateClass);         // Update
router.delete('/:id',verifystaff,checkPermission('class','delete'), deleteClass);      // Delete

module.exports = router;
