const express = require('express');
const router = express.Router();
const seatAllotmentController = require('../controllers/seatAllotmentController');

// You can add middleware like auth here if needed
// const { protect, admin } = require('../middleware/auth');

router.get('/', seatAllotmentController.getAll);
router.get('/:id', seatAllotmentController.getOne);
router.post('/', seatAllotmentController.create);
router.post('/bulk', seatAllotmentController.bulkCreate);
router.patch('/:id', seatAllotmentController.update);
router.delete('/:id', seatAllotmentController.delete);

module.exports = router;