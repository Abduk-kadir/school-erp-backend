const express = require('express');
const router = express.Router();
const {
  allColumnOfTable,
  exportAllStudentData,
  importStudentData,
} = require('../controllers/downloadStudentDataController');
const upload = require('../middlewares/importexcelMiddleware');

router.get('/allcolumn', allColumnOfTable);
router.post('/', exportAllStudentData);
router.post('/import', upload.single('file'), importStudentData);

module.exports = router;
