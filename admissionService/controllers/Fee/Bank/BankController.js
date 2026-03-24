// controllers/banksController.js
const { Bank } = require('../../../models');

const banksController = {
  // ── GET /api/banks ── List active banks (most common use-case)
  async getActiveBanks(req, res) {
    try {
      const banks = await Bank.findAll({
        where: { status: 'active' },
        attributes: ['id', 'bank_name','status'],
        raw:true
      });

      return res.json({
        success: true,
        data: banks,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Failed to fetch banks' });
    }
  },

  // ── GET /api/banks/all ── Admin / debug - show all (incl. inactive)
  async getAllBanks(req, res) {
    try {
      // You can add admin middleware check here later
      const banks = await Bank.findAll({
        order: [['bank_name', 'ASC']],
      });

      return res.json({
        success: true,
        data: banks,
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // ── POST /api/banks ── Create new bank (admin only)
  async createBank(req, res) {
    try {
      const { bank_name, status = 'active' } = req.body;

      if (!bank_name) {
        return res.status(400).json({ success: false, message: 'bank_name is required' });
      }

      const [bank, created] = await Bank.findOrCreate({
        where: { bank_name },
        defaults: { bank_name, status },
      });

      if (!created) {
        return res.status(409).json({
          success: false,
          message: 'Bank with this name already exists',
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Bank created',
        data: bank,
      });
    } catch (err) {
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ success: false, message: 'Bank name already exists' });
      }
      console.error(err);
      return res.status(500).json({ success: false, message: 'Failed to create bank' });
    }
  },

  // ── PATCH /api/banks/:id ── Update bank (e.g. change status)
  async updateBank(req, res) {
    try {
      const { id } = req.params;
      const { status, display_name, logo_url } = req.body;

      const bank = await Bank.findByPk(id);
      if (!bank) {
        return res.status(404).json({ success: false, message: 'Bank not found' });
      }

      await bank.update({ status, display_name, logo_url });

      return res.json({
        success: true,
        message: 'Bank updated',
        data: bank,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Failed to update bank' });
    }
  },
};

module.exports = banksController;