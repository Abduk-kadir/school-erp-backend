const express = require('express');
const router = express.Router();
const { uploadAssignment } = require('../../middlewares/multerConfig');
const assignmentController = require('../../controllers/assignment/assignmentController');

router.post('/', uploadAssignment.single('assignment'), assignmentController.create);
router.get('/', assignmentController.getAll);

module.exports = router;
