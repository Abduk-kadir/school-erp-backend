const express = require('express');
const router = express.Router();
const { uploadNotification } = require('../../middlewares/multerConfig');
const studentnotificationController = require('../../controllers/studentnotification/studentnotificationController');

router.post('/', uploadNotification.single('document'), studentnotificationController.create);
router.get('/student/:reg_no', studentnotificationController.getNotificationStudent);
router.get('/pdf', studentnotificationController.notificationPdf);
router.get('/excel', studentnotificationController.notificationExcel);
router.get('/', studentnotificationController.getAll);

module.exports = router;
