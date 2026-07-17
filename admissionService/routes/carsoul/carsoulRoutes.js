const express = require('express');
const router = express.Router();
const { uploadCarsolSlide } = require('../../middlewares/multerConfig');
const carsoulController = require('../../controllers/carsoul/carsoulController');

router.post('/', uploadCarsolSlide.array('images', 10), carsoulController.create);
router.get('/', carsoulController.getAll);
router.put('/:id', uploadCarsolSlide.array('images', 1), carsoulController.update);
router.delete('/:id', carsoulController.delete);

module.exports = router;
