const { FeesType } = require('../models');

exports.create = async (req, res) => {
  try {
    const { name } = req.body;

    if (name == null || String(name).trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'name is required'
      });
    }

    const created = await FeesType.create({ name: String(name).trim() });

    return res.status(201).json({
      success: true,
      message: 'Fees type created successfully',
      data: created
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await FeesType.findAll({ order: [['id', 'ASC']] });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

