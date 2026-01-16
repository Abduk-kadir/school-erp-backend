const { Stage } = require('../models');

exports.getAllStages = async (req, res) => {
  try {
    const stages = await Stage.findAll({
      order: [['order', 'ASC']],
    });
    res.json({ success: true, data: stages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getStageById = async (req, res) => {
  try {
    const stage = await Stage.findByPk(req.params.id, {
      include: [{ model: Field, as: 'fields' }],
    });
    if (!stage) return res.status(404).json({ success: false, message: 'Stage not found' });
    res.json({ success: true, data: stage });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createStage = async (req, res) => {
  try {
    const { name, description, order = 0 } = req.body;
    const stage = await Stage.create({ name, description, order });
    res.status(201).json({ success: true, data: stage });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.updateStage = async (req, res) => {
  try {
    const stage = await Stage.findByPk(req.params.id);
    if (!stage) return res.status(404).json({ success: false, message: 'Stage not found' });

    await stage.update(req.body);
    res.json({ success: true, data: stage });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteStage = async (req, res) => {
  try {
    const stage = await Stage.findByPk(req.params.id);
    if (!stage) return res.status(404).json({ success: false, message: 'Stage not found' });

    await stage.destroy();
    res.json({ success: true, message: 'Stage deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};