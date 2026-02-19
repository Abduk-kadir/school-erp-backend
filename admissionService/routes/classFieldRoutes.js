const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/classFieldController');

router
  .route('/')
  .get(ctrl.getAll)
  .post(ctrl.create);

router
  .route('/:id')
  .get(ctrl.getOne)
  .patch(ctrl.update)
  .delete(ctrl.delete);

router.get('/class/:classId', ctrl.getFieldsByClass);

module.exports = router;