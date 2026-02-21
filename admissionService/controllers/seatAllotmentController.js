const { seatAllotment, class_master, Category } = require('../models');
const { Op } = require('sequelize');

const seatAllotmentController = {
  // GET /api/seat-allotments
  async getAll(req, res) {
    try {
      const allotments = await seatAllotment.findAll({
        include: [
          { model: class_master, as: 'class', attributes: ['id', 'class_name'] },
          { model: Category, as: 'category', attributes: ['id', 'name'] }
        ],
        order: [['class_id', 'ASC'], ['admission_category', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        data: allotments
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // GET /api/seat-allotments/:id
  async getOne(req, res) {
    try {
      const { id } = req.params;

      const allotment = await seatAllotment.findByPk(id, {
        include: [
          { model: class_master, as: 'class' },
          { model: Category, as: 'category' }
        ]
      });

      if (!allotment) {
        return res.status(404).json({ success: false, message: 'Seat allotment not found' });
      }

      return res.status(200).json({ success: true, data: allotment });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // POST /api/seat-allotments
  async create(req, res) {
    try {
      const { class_id, admission_category, no_seat, is_merit_list } = req.body;

      // Basic validation
      if (!class_id || !admission_category || !no_seat) {
        return res.status(400).json({
          success: false,
          message: 'class_id, admission_category and no_seat are required'
        });
      }

      const existing = await seatAllotment.findOne({
        where: {
          class_id,
          admission_category,
          is_merit_list: is_merit_list || false
        }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Seat allotment for this class + category + merit type already exists'
        });
      }

      const newAllotment = await seatAllotment.create({
        class_id,
        admission_category,
        no_seat: parseInt(no_seat),
        is_merit_list: !!is_merit_list
      });

      const created = await seatAllotment.findByPk(newAllotment.id, {
        include: [
          { model: class_master, as: 'class' },
          { model: Category, as: 'category' }
        ]
      });

      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
  },

  // POST /api/seat-allotments/bulk
// POST /api/seat-allotments/bulk
async bulkCreate(req, res) {
  try {
    const items = req.body; // expect array of objects

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body must be a non-empty array of seat allotment objects'
      });
    }

    // Basic structure validation
    const invalidItems = items.filter(item =>
      !item.class_id ||
      !item.admission_category ||
      item.no_seat == null || // allow 0
      typeof item.no_seat !== 'number'
    );

    if (invalidItems.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some items are missing required fields (class_id, admission_category, no_seat)',
        invalidCount: invalidItems.length,
        exampleRequired: { class_id: 5, admission_category: "OPEN", no_seat: 45, is_merit_list: true }
      });
    }

    // Prepare records with proper types
    const records = items.map(item => ({
      class_id: Number(item.class_id),
      admission_category: String(item.admission_category).trim(),
      no_seat: Number(item.no_seat),
      is_merit_list: !!item.is_merit_list,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Find existing combinations (to skip them)
    const uniqueKeys = records.map(r => ({
      class_id: r.class_id,
      admission_category: r.admission_category,
      is_merit_list: r.is_merit_list
    }));

    const existing = await seatAllotment.findAll({
      where: {
        [Op.or]: uniqueKeys.map(key => ({
          class_id: key.class_id,
          admission_category: key.admission_category,
          is_merit_list: key.is_merit_list
        }))
      },
      attributes: ['class_id', 'admission_category', 'is_merit_list'],
      raw: true
    });

    // Create lookup Set for fast check
    const existingSet = new Set(
      existing.map(e =>
        `${e.class_id}|${e.admission_category}|${e.is_merit_list}`
      )
    );

    // Filter out duplicates
    const toCreate = records.filter(r => {
      const key = `${r.class_id}|${r.admission_category}|${r.is_merit_list}`;
      return !existingSet.has(key);
    });

    let createdCount = 0;
    let skippedCount = records.length - toCreate.length;

    if (toCreate.length > 0) {
      const result = await seatAllotment.bulkCreate(toCreate, {
        validate: true,       // run model validations
        individualHooks: true // if you have hooks (beforeCreate etc.)
      });
      createdCount = result.length;
    }

    return res.status(201).json({
      success: true,
      message: `Created ${createdCount} new seat allotments. ${skippedCount} were skipped (already exist).`,
      created: createdCount,
      skipped: skippedCount,
      totalReceived: records.length
    });

  } catch (error) {
    console.error('Bulk create error:', error);
    return res.status(500).json({
      success: false,
      message: 'Bulk create failed',
      error: error.message || 'Internal server error'
    });
  }
},

  // PATCH /api/seat-allotments/:id
  async update(req, res) {
    try {
      const { id } = req.params;
      const { no_seat, is_merit_list } = req.body;

      const allotment = await seatAllotment.findByPk(id);
      if (!allotment) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }

      await allotment.update({
        no_seat: no_seat !== undefined ? parseInt(no_seat) : allotment.no_seat,
        is_merit_list: is_merit_list !== undefined ? !!is_merit_list : allotment.is_merit_list
      });

      const updated = await seatAllotment.findByPk(id, {
        include: [
          { model: class_master, as: 'class' },
          { model: Category, as: 'category' }
        ]
      });

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // DELETE /api/seat-allotments/:id
  async delete(req, res) {
    try {
      const { id } = req.params;

      const deletedCount = await seatAllotment.destroy({ where: { id } });

      if (deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }

      return res.status(200).json({ success: true, message: 'Seat allotment deleted' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = seatAllotmentController;