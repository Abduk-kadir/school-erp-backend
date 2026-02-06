const express = require('express');
const router = express.Router();
const studentDeclarationController = require('../controllers/studentDeclarationController');

// Recommended: protect these routes with auth middleware in real app
// const { auth, authorize } = require('../middleware/auth');

router.post('/', studentDeclarationController.create);
router.get('/student/:reg_no', studentDeclarationController.getByRegNo);
//router.get('/:id', studentDeclarationController.getOne);
router.patch('/:id', studentDeclarationController.update);

// Optional admin endpoints
// router.get('/', studentDeclarationController.getAll);
// router.delete('/:id', studentDeclarationController.delete);

module.exports = router;