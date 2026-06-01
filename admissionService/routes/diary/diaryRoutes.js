const express = require('express');
const router = express.Router();
const { uploadDiary } = require('../../middlewares/multerConfig');
const diaryController = require('../../controllers/diary/diaryController');

router.post('/', uploadDiary.single('diary'), diaryController.create);
router.get('/', diaryController.getAll);

module.exports = router;
