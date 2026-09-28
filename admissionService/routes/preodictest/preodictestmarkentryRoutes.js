const express = require('express');
const router = express.Router();
const preodictestmarkentryController = require('../../controllers/preodictest/preodictestmarkentryController');

router.post('/bulk', preodictestmarkentryController.bulkCreate);
router.get('/by-test/:preodictest_id', preodictestmarkentryController.getByTestId);
router.get('/by-regno/:reg_no', preodictestmarkentryController.getByRegNo);
router.get(
  '/filter-students',
  preodictestmarkentryController.filterStudentPreodictest
);
router.post('/', preodictestmarkentryController.create);
router.get('/:id', preodictestmarkentryController.getById);
router.put('/:id', preodictestmarkentryController.update);
router.delete('/:id', preodictestmarkentryController.delete);

module.exports = router;
