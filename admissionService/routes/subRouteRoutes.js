const express = require('express');
const router = express.Router();

const {
  getAllSubRoutes,
  getSubRouteById,
  createSubRoute,
  updateSubRoute,
  deleteSubRoute,
} = require('../controllers/subRouteController');

// Optional: add validation middleware later (joi, express-validator, zod, ...)

router.get('/', getAllSubRoutes);
router.get('/:id', getSubRouteById);

router.post('/', createSubRoute);

router.patch('/:id', updateSubRoute);
router.delete('/:id', deleteSubRoute);

module.exports = router;