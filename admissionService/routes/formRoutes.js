// routes/admin/stages.js
let stageController=require('../controllers/stageController')
let fieldController=require('../controllers/fieldController')
let fieldOptionController=require('../controllers/fieldOptionController')
let fieldTypeController=require('../controllers/fieldTypeController')
let admissionPublicController=require('../controllers/admissionPublicController')

const express = require('express');
const router = express.Router();

router.get('/stage', stageController.getAllStages);
//router.get('/:id', stageController.getStageById);
router.post('/stage', stageController.createStage);
//router.put('/:id', stageController.updateStage);
//router.delete('/:id', stageController.deleteStage);

// routes/admin/fields.js
router.get('/stage/allfiled/:stageId', fieldController.getFieldsByStage);
router.post('/stage/addfield/:stageId', fieldController.createField);
router.get('/allfield',fieldController.getallField)
//router.put('/:id', fieldController.updateField);
//router.delete('/:id', fieldController.deleteField);

// routes/admin/field-options.js
router.get('/fieldOption/:fieldId', fieldOptionController.getOptionsByField);
router.post('/fieldOption/:fieldId', fieldOptionController.createOption);
//router.delete('/:id', fieldOptionController.deleteOption);

// routes/admin/field-types.js  (mostly read-only)
router.get('/fieldType', fieldTypeController.getAllFieldTypes);
router.post('/fieldType', fieldTypeController.createFieldType);

// routes/public/admission.js
router.get('/form-structure', admissionPublicController.getFullFormStructure);
module.exports=router