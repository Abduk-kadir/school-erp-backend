const express = require('express');
const router = express.Router();

const {
  createDeclaration,
  getAllDeclarations,
 getDeclarationByClassId,
  updateDeclaration,
  deleteDeclaration,
} = require('../controllers/declarationController');

// POST    /api/declarations           → Create new declaration
// GET     /api/declarations           → Get all (can filter ?class_id=)
// GET     /api/declarations/:id       → Get one declaration
// PUT     /api/declarations/:id       → Update declaration
// DELETE  /api/declarations/:id       → Delete declaration

router.post('/', createDeclaration);
router.get('/', getAllDeclarations);
router.get('/:classId', getDeclarationByClassId);
//router.put('/:id', updateDeclaration);
router.delete('/:id', deleteDeclaration);

module.exports = router;