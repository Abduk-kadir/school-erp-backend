const express = require('express');
const router = express.Router();
const { uploadOtherCarsolSlide } = require('../../middlewares/multerConfig');
const othercrousalController = require('../../controllers/othercrousal/othercrousalController');

router.post('/', uploadOtherCarsolSlide.array('images', 10), othercrousalController.create);
router.get('/', othercrousalController.getAll);
router.put('/:id', uploadOtherCarsolSlide.array('images', 1), othercrousalController.update);
router.delete('/:id', othercrousalController.delete);

module.exports = router;
