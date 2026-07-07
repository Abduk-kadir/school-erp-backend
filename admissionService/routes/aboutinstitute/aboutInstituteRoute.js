const express = require('express');
const router = express.Router();
const { uploadAboutInstituteImage } = require('../../middlewares/multerConfig');
const aboutInstituteController = require('../../controllers/aboutinstitute/aboutInstituteController');

router.post('/', uploadAboutInstituteImage.array('images', 10), aboutInstituteController.create);
router.get('/', aboutInstituteController.getAll);
router.delete('/:id', aboutInstituteController.delete);




module.exports = router;
