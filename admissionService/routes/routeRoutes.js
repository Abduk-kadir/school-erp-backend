const express = require('express');
const router = express.Router();

const {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute,
} = require('../controllers/routeController');

// You can add validation middleware later (e.g. express-validator, joi, celebrate)

router.get('/', getAllRoutes);
router.get('/:id', getRouteById);

router.post('/', createRoute);

router.patch('/:id', updateRoute);
router.delete('/:id', deleteRoute);

module.exports = router;