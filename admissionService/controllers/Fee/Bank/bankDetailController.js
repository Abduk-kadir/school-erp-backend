// controllers/bankDetailsController.js
const asyncHandler = require('express-async-handler');
const { BankDetail, Bank } = require('../../../models');

const bankDetailsController = {
  // Get all bank details of a user
  getMyBankDetails: asyncHandler(async (req, res) => {
    const details = await BankDetail.findAll({
      include: [
        {
          model: Bank,
          as: 'bank',
          attributes: ['bank_name'],
          required: true,
        },
      ],
    });

    return res.status(200).json({
      success: true,
      data: details,
    });
  }),

  // Add new bank detail
  createBankDetail: asyncHandler(async (req, res) => {
    const { bank_id, ifsc_code, account_number } = req.body;

    const bankDetail = await BankDetail.create({
      bank_id,
      ifsc_code,
      account_number,
    });

    return res.status(201).json({
      success: true,
      message: 'Bank detail added successfully',
      data: bankDetail,
    });
  }),

  // Delete bank detail
  deleteBankDetail: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const bankDetail = await BankDetail.findByPk(id);
    if (!bankDetail) {
      return res.status(404).json({
        success: false,
        message: 'Bank detail not found',
      });
    }

    await bankDetail.destroy();

    return res.status(200).json({
      success: true,
      message: 'Bank detail deleted successfully',
    });
  }),
};

module.exports = bankDetailsController;
