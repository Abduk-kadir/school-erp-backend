const { Field } = require('../models');

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