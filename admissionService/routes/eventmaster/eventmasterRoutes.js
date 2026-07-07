const express = require('express');
const router = express.Router();

const eventmasterController = require('../../controllers/eventmaster/eventmasterController');

router.post('/', eventmasterController.create);
router.get('/student/:reg_no', eventmasterController.getEventMasterStudent);
router.get('/', eventmasterController.getAll);
router.delete('/:id', eventmasterController.delete);
module.exports = router;
