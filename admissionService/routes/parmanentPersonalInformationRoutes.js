const express = require('express');
const router = express.Router();
const ParmanentPersonalInformation = require('../controllers/parmanentPersonalInformationController');

router.post('/', ParmanentPersonalInformation.create);
router.get('/', ParmanentPersonalInformation.getAll);
router.get('/reg/:reg_no', ParmanentPersonalInformation.getByReg);
router.put('/:id', ParmanentPersonalInformation.update);
router.delete('/:id', ParmanentPersonalInformation.remove);

module.exports = router;
