const { FeeHead, Bank } = require('../../../models');
const { Op } = require('sequelize');

const feeHeadController = {
  // GET /api/fee-heads
  async getAllFeeHeads(req, res) {
    try {
      const feeHeads = await FeeHead.findAll({
        include: [
          {
            model: Bank,
            as: 'bank',
            attributes: ['bank_name'], // select only needed fields
          },
        ],
      
      });

      return res.status(200).json({
        success: true,
        data: feeHeads,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fee heads',
        error: error.message,
      });
    }
  },

  // GET /api/fee-heads/:id
  async getFeeHeadById(req, res) {
    try {
      const { id } = req.params;

      const feeHead = await FeeHead.findByPk(id, {
        include: [{ model: Bank, as: 'bank' }],
      });

      if (!feeHead) {
        return res.status(404).json({
          success: false,
          message: 'Fee head not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: feeHead,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  // POST /api/fee-heads
  async createFeeHead(req, res) {
    try {
      const { fee_head_name, bank_id, is_refundable, status } = req.body;

      

      const feeHead = await FeeHead.create({
        fee_head_name,
        bank_id: bank_id || null,
        is_refundable: is_refundable || 'no', // default value
        status: status || 'active',           // default value
      });

      
      return res.status(201).json({
        success: true,
        message: 'Fee head created successfully',
       
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create fee head',
        error: error.message,
      });
    }
  },

  // PUT /api/fee-heads/:id
  async updateFeeHead(req, res) {
    try {
      const { id } = req.params;
      const { fee_head_name, bank_id, is_refundable, status } = req.body;

      const feeHead = await FeeHead.findByPk(id);
      if (!feeHead) {
        return res.status(404).json({
          success: false,
          message: 'Fee head not found',
        });
      }

      await feeHead.update({
        fee_head_name: fee_head_name ?? feeHead.fee_head_name,
        bank_id: bank_id !== undefined ? bank_id : feeHead.bank_id,
        is_refundable: is_refundable ?? feeHead.is_refundable,
        status: status ?? feeHead.status,
      });

      const updated = await FeeHead.findByPk(id, {
        include: [{ model: Bank, as: 'bank' }],
      });

      return res.status(200).json({
        success: true,
        message: 'Fee head updated successfully',
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update fee head',
        error: error.message,
      });
    }
  },

  // DELETE /api/fee-heads/:id
  async deleteFeeHead(req, res) {
    try {
      const { id } = req.params;

      const feeHead = await FeeHead.findByPk(id);
      if (!feeHead) {
        return res.status(404).json({
          success: false,
          message: 'Fee head not found',
        });
      }

      await feeHead.destroy();

      return res.status(200).json({
        success: true,
        message: 'Fee head deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete fee head',
        error: error.message,
      });
    }
  },
};

module.exports = feeHeadController;