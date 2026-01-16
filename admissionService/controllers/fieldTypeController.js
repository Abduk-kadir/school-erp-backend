const { FieldType } = require('../models');

exports.getAllFieldTypes = async (req, res) => {
  try {
    const types = await FieldType.findAll();
    res.json({ success: true, data: types });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Usually you don't create/update/delete field types via API — they come from seed
// But if you want admin flexibility:
exports.createFieldType = async (req, res) => {
  try {
    const type = await FieldType.create(req.body);
    res.status(201).json({ success: true, data: type });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};