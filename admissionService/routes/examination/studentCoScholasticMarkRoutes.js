const express = require('express');
const router = express.Router();
const studentCoScholasticMarkController = require('../../controllers/examination/studentCoScholasticMarkController');
const  upload  = require('../../middlewares/importexcelMiddleware');
router.post('/', studentCoScholasticMarkController.create);
router.get('/', studentCoScholasticMarkController.getAll);
router.post('/import-co-scholastic-marks', upload.single('file'), studentCoScholasticMarkController.importCoScholasticMarks);

module.exports = router;
