const { FieldOption } = require('../models');

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