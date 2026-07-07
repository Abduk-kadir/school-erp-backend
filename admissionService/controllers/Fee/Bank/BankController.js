// controllers/banksController.js
const asyncHandler = require('express-async-handler');
const { Bank, BankDetail, sequelize } = require('../../../models');

const banksController = {
  // ── GET /api/banks ── List active banks (most common use-case)
  getActiveBanks: asyncHandler(async (req, res) => {
    const banks = await Bank.findAll({
      where: { status: 'active' },
      attributes: ['id', 'bank_name', 'status'],
      raw: true,
    });

    return res.json({
      success: true,
      data: banks,
    });
  }),

  // ── GET /api/banks/all ── Admin / debug - show all (incl. inactive)
  getAllBanks: asyncHandler(async (req, res) => {
    const banks = await Bank.findAll({
      order: [['bank_name', 'ASC']],
    });

    return res.json({
      success: true,
      data: banks,
    });
  }),

  // ── POST /api/banks ── Create new bank (admin only)
  createBank: asyncHandler(async (req, res) => {
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
  }),

  // ── PATCH /api/banks/:id ── Update bank (e.g. change status)
  updateBank: asyncHandler(async (req, res) => {
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
  }),

  // ── DELETE /api/banks/:id ── Delete bank
  deleteBank: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const bank = await Bank.findByPk(id);
    if (!bank) {
      return res.status(404).json({ success: false, message: 'Bank not found' });
    }

    await sequelize.transaction(async (t) => {
      await BankDetail.destroy({ where: { bank_id: id }, transaction: t });
      await bank.destroy({ transaction: t });
    });

    return res.json({
      success: true,
      message: 'Bank deleted',
    });
  }),
};

module.exports = banksController;
