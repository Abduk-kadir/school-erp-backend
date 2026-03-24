// controllers/bankDetailsController.js
const { BankDetail ,Bank} = require('../../../models');
const { Op } = require('sequelize');

const bankDetailsController = {
  // Get all bank details of a user
  async getMyBankDetails(req, res) {
    try {
    

      const details = await BankDetail.findAll({
        include: [
          {
            model: Bank,
            as: 'bank',                        // must match the alias you defined in associate()
            attributes: [ 'bank_name'], // pick what you want
            required: true,                    // only return records with valid bank
          },
        ],
        
      });

      return res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // Add new bank detail
  async createBankDetail(req, res) {
    try {
     
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
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: error.message || 'Server error' });
    }
  },

  // Delete bank detail (soft delete if paranoid: true)
  async deleteBankDetail(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const deleted = await BankDetail.destroy({
        where: { id, userId },
      });

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Bank detail not found or not authorized',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Bank detail deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },
};

module.exports = bankDetailsController;