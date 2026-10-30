const express = require('express');
const router = express.Router();
const resultMarkEntryListController = require('../../controllers/examination/resultMarkEntryListController');

router.post('/', resultMarkEntryListController.create);
router.get('/', resultMarkEntryListController.getAll);

module.exports = router;
