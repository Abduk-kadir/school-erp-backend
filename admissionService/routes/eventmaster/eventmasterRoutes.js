const express = require('express');
const router = express.Router();

const eventmasterController = require('../../controllers/eventmaster/eventmasterController');

router.post('/', eventmasterController.create);
router.get('/student/:reg_no', eventmasterController.getEventMasterStudent);
router.get('/', eventmasterController.getAll);
module.exports = router;
