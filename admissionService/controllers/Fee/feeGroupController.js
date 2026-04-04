const { FeeGroup , FeeGroupDetail,FeeGroupDetailPrice,Group} = require('../../models');

const feeGroupController = {


  async creategroupDetailAndPricing(req, res) {
    try {
      const { groupdetails, groupPricingRecord } = req.body;

      if (!groupPricingRecord || !Array.isArray(groupPricingRecord) || groupPricingRecord.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'groupPricingRecord must be a non-empty array'
        });
      }

      // Step 1: Create Single FeeGroupDetail
      const createdFeeGroupDetail = await FeeGroupDetail.create(groupdetails);

      // Step 2: Map feeGroupDetailId to all pricing records
      const pricingData = groupPricingRecord.map((pricing) => ({
        ...pricing,
        groupdetailid: createdFeeGroupDetail.id
      }));

      // Step 3: Bulk Create Pricing Records
      const createdPricingRecords = await FeeGroupDetailPrice.bulkCreate(pricingData, {
        validate: true,
        returning: true
      });

      return res.status(201).json({
        success: true,
        message: 'Fee Group Detail and Pricing created successfully',
        
      });

    } catch (error) {
      console.error('Error creating fee group detail and pricing:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create fee group detail and pricing',
        error: error.message
      });
    }
  },







  async getAllFeeGroups(req, res) {
    try {
      const feeGroups = await FeeGroup.findAll({
        order: [['id', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        data: feeGroups
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fee groups',
        error: error.message
      });
    }
  },

  async getFeeGroupById(req, res) {
    try {
      const { id } = req.params;
      const feeGroup = await FeeGroup.findByPk(id);

      if (!feeGroup) {
        return res.status(404).json({
          success: false,
          message: 'Fee group not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: feeGroup
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  },

  async createFeeGroup(req, res) {
    try {
      const { groupname } = req.body;

      if (groupname == null || String(groupname).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'groupname is required'
        });
      }

      const feeGroup = await FeeGroup.create({
        groupname: String(groupname).trim()
      });

      return res.status(201).json({
        success: true,
        message: 'Fee group created successfully',
        data: feeGroup
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          success: false,
          message: 'A fee group with this name already exists',
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to create fee group',
        error: error.message
      });
    }
  },

  async updateFeeGroup(req, res) {
    try {
      const { id } = req.params;
      const { groupname } = req.body;

      const feeGroup = await FeeGroup.findByPk(id);
      if (!feeGroup) {
        return res.status(404).json({
          success: false,
          message: 'Fee group not found'
        });
      }

      await feeGroup.update({
        groupname:
          groupname !== undefined ? String(groupname).trim() : feeGroup.groupname
      });

      const updated = await FeeGroup.findByPk(id);

      return res.status(200).json({
        success: true,
        message: 'Fee group updated successfully',
        data: updated
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          success: false,
          message: 'A fee group with this name already exists',
          error: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to update fee group',
        error: error.message
      });
    }
  },

  async deleteFeeGroup(req, res) {
    try {
      const { id } = req.params;

      const feeGroup = await FeeGroup.findByPk(id);
      if (!feeGroup) {
        return res.status(404).json({
          success: false,
          message: 'Fee group not found'
        });
      }

      await feeGroup.destroy();

      return res.status(200).json({
        success: true,
        message: 'Fee group deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete fee group',
        error: error.message
      });
    }
  }
};

module.exports = feeGroupController;
