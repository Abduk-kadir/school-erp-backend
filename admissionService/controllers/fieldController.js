const { Field,Stage,FieldType } = require('../models');
const { sequelize, Op } = require('../models');


exports.getFieldsByStage = async (req, res) => {
  try {
    const fields = await Field.findAll({
      where: { stageId: req.params.stageId },
      order: [['order', 'ASC']],
      include: ['fieldType', 'options'],
    });
    res.json({ success: true, data: fields });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// At the top of the file (if not already there)
// or wherever your models/index.js exports sequelize

exports.getallField = async (req, res) => {
  try {
    const fields = await Field.findAll({
      raw: true,  // important → returns flat objects
      attributes: [
        'id',
        'name',
        'label',
        'isRequired',
        'placeholder',
        'defaultValue',
        'order',
        [sequelize.col('stage.name'), 'stageName'],           // alias for stage name
        [sequelize.col('fieldType.typeName'), 'fieldTypeName'] // alias for field type name
      ],
      include: [
        {
          model: Stage,
          as: 'stage',
          attributes: []  // we only want the name via alias
        },
        {
          model: FieldType,
          as: 'fieldType',   // ← correct alias
          attributes: []     // we only want typeName via alias
        }
      ],
      order: [
        [sequelize.col('stage.order'), 'ASC'],  // first sort by stage order
        ['order', 'ASC']                        // then by field order inside stage
      ]
    });

    res.json({
      success: true,
      data: fields
    });
  } catch (err) {
    console.error('Error fetching all fields:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Server error while fetching fields'
    });
  }
};
exports.createField = async (req, res) => {
  try {
    console.log('filed type id:',req.body.filedTypeId)
    const field = await Field.create({
      ...req.body,
      stageId: req.params.stageId || req.body.stageId,
    });
    res.status(201).json({ success: true, data: field });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateField = async (req, res) => {
  try {
    const field = await Field.findByPk(req.params.id);
    if (!field) return res.status(404).json({ success: false, message: 'Field not found' });
    await field.update(req.body);
    res.json({ success: true, data: field });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteField = async (req, res) => {
  try {
    const field = await Field.findByPk(req.params.id);
    if (!field) return res.status(404).json({ success: false, message: 'Field not found' });
    await field.destroy();
    res.json({ success: true, message: 'Field deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};