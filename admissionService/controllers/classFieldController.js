const { class_field, class_master, Field, Stage } = require('../models');

const classFieldController = {

  // GET /api/class-fields
  async getAll(req, res) {
    try {
      const items = await class_field.findAll({
        include: [
          { model: class_master, as: 'class', attributes: ['id', 'name'] },
          { model: Field, as: 'field', attributes: ['id', 'name', 'label'] },
          { model: Stage, as: 'stage', attributes: ['id', 'name'] },
        ],
        order: [['class_id', 'ASC'], ['stage_id', 'ASC']],
      });
      return res.json(items);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // GET /api/class-fields/:id
  async getOne(req, res) {
    try {
      const item = await class_field.findByPk(req.params.id, {
        include: [
          { model: class_master, as: 'class' },
          { model: Field, as: 'field' },
          { model: Stage, as: 'stage' },
        ],
      });

      if (!item) return res.status(404).json({ message: 'Not found' });
      return res.json(item);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // POST /api/class-fields
  async create(req, res) {
    try {
      const { class_id, field_id, stage_id, is_required } = req.body;

      if (!class_id || !field_id || !stage_id) {
        return res.status(400).json({ message: 'class_id, field_id, stage_id are required' });
      }

      const [relation, created] = await class_field.findOrCreate({
        where: { class_id, field_id, stage_id },
        defaults: { is_required: !!is_required },
      });

      if (!created) {
        return res.status(409).json({ message: 'This combination already exists' });
      }

      const full = await class_field.findByPk(relation.id, {
        include: [
          { model: Class, as: 'class' },
          { model: Field, as: 'field' },
          { model: Stage, as: 'stage' },
        ],
      });

      return res.status(201).json(full);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  // PATCH /api/class-fields/:id
  async update(req, res) {
    try {
      const item = await class_field.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: 'Not found' });

      const { is_required, stage_id } = req.body;

      await item.update({
        is_required: is_required !== undefined ? Boolean(is_required) : item.is_required,
        stage_id: stage_id ?? item.stage_id,
      });

      const updated = await class_field.findByPk(item.id, {
        include: ['class', 'field', 'stage'],
      });

      return res.json(updated);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  },

  // DELETE /api/class-fields/:id
  async delete(req, res) {
    try {
      const item = await class_field.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: 'Not found' });

      await item.destroy();
      return res.status(204).end();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },

  // Bonus: GET /api/classes/:classId/fields
  async getFieldsByClass(req, res) {
    try {
      const { classId } = req.params;

      const relations = await class_field.findAll({
        where: { class_id: classId },
        include: [
          { model: Field, as: 'field' },
          { model: Stage, as: 'stage' },
        ],
        order: [['stage_id', 'ASC']],
      });

      return res.json(relations);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  },
};

module.exports = classFieldController;