const { FieldOption } = require('../models');
const { Field} = require('../models');
const {sequelize}=require('../models')
const {tableConfig}=require('../../utils/tableConfig')

exports.createmultipleOption = async (req, res) => {
  try {
    const fieldId = req.params.fieldId || req.body.fieldId;
    const {tablename}=req.body
    if (!fieldId) {
      return res.status(400).json({
        success: false,
        message: "fieldId is required (in params or body)"
      });
    }
   

    const config = tableConfig[tablename];

    if (!config) {
      return res.status(400).json({
        success: false,
        message: "Invalid table name",
      });
    }
   
   let {model}=config
   let data=await model.findAll({ raw: true })
   
    const preparedOptions = data.map(item => ({
      ...item,
      fieldId: item.fieldId || fieldId,  // prefer item's fieldId if sent, else from param/body
    }));
    console.log(preparedOptions)
    // Bulk create - very efficient for many rows
    await FieldOption.destroy({ where: { fieldId } });
   const createdOptions = await FieldOption.bulkCreate(preparedOptions, {
      validate: true,           // run validations on each row
      individualHooks: true,    // run hooks (if you have any) on each record
      returning: true           // return created rows (supported in PostgreSQL, MySQL 8+)
    });
  
    res.status(201).json({
      success: true,
      //message: `Created ${createdOptions.length} option(s) successfully`,
      data: data
    });
  } catch (err) {
    console.error('Error creating options:', err);

    // Handle Sequelize validation errors nicely
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: err.errors.map(e => ({
          field: e.path,
          message: e.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: err.message || 'Server error while creating options'
    });
  }
};




exports.getOptionsByField = async (req, res) => {
  try {
    const options = await FieldOption.findAll({
      where: { fieldId: req.params.fieldId },
      order: [['order', 'ASC']],
    });
    res.json({ success: true, data: options });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// At top of file


exports.getAllOption = async (req, res) => {
  try {
    const options = await FieldOption.findAll({
      raw: true,
      attributes: [
        'id',
        
        'value',
        
        [sequelize.col('field.name'), 'fieldName'],
       
      ],
      include: [{
        model: Field,
        as: 'field',
        attributes: []   // no need to select columns again
      }],
      
    });

    res.json({
      success: true,
      data: options
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error'
    });
  }
};

exports.createOption = async (req, res) => {
  try {
    const option = await FieldOption.create({
      ...req.body,
      fieldId: req.params.fieldId || req.body.fieldId,
    });
    res.status(201).json({ success: true, data: option });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteOption = async (req, res) => {
  try {
    const option = await FieldOption.findByPk(req.params.id);
    if (!option) return res.status(404).json({ success: false, message: 'Option not found' });
    await option.destroy();
    res.json({ success: true, message: 'Option deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};