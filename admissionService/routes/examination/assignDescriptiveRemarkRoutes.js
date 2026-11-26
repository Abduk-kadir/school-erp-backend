const express = require('express');
const router = express.Router();
const assignDescriptiveRemarkController = require('../../controllers/examination/assignDescriptiveRemarkController');

router.post('/', assignDescriptiveRemarkController.create);
router.put('/', assignDescriptiveRemarkController.update);
router.get(
  '/one-student',
  assignDescriptiveRemarkController.getOnneStudentForDescriptiveRemark
);
router.get('/', assignDescriptiveRemarkController.getAll);

module.exports = router;
