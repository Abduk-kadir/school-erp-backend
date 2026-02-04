const express = require('express');
const router = express.Router();

const {
  getAllElectiveBaskets,
  getBasketsByClassAndSemester,
  getElectiveBasketById,
  createElectiveBasket,
  updateElectiveBasket,
  deleteElectiveBasket,
} = require('../controllers/electiveBasketController');

// Routes
router.get('/', getAllElectiveBaskets);
router.get('/class/:classId/semester/:semester', getBasketsByClassAndSemester);
router.get('/:id', getElectiveBasketById);
router.post('/', createElectiveBasket);
router.put('/:id', updateElectiveBasket);
router.delete('/:id', deleteElectiveBasket);

module.exports = router;