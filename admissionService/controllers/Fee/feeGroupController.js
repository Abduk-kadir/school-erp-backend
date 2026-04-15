const {
  FeeGroup,
  FeeGroupDetail,
  FeeGroupDetailPrice,
  FeeGroupHead,
  FeeHead,
  PersonalInformation,
 
} = require('../../models');

const feeGroupController = {
  /**
   * Fee assignment for a student: par_student_personal_information → FeeGroup →
   * FeeGroupDetail → FeeGroupDetailPrice (+ FeeHead per row).
   * @route GET .../student/:regNo/assigned-fees
   */
  async getfeeAssignedToStudent(req, res) {
    try {
      const { regNo } = req.params;
      if (regNo == null || String(regNo).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Student reg_no is required (route param regNo)'
        });
      }

      const reg_no = String(regNo).trim();

      const student = await PersonalInformation.findOne({
        where: { reg_no },
        attributes: [
          'reg_no',
          'first_name',
          'last_name',
          'class',
          'division',
          'groupid'
        ],
        include: [
          {
            model: FeeGroup,
            as: 'feeGroup',
            required: false,
            include: [
              {
                model: FeeGroupDetail,
                as: 'feeGroupDetails',
                required: false,
                include: [
                  {
                    model: FeeGroupDetailPrice,
                    as: 'feeGroupDetailPrices',
                    required: false,
                    include: [
                      {
                        model: FeeHead,
                        as: 'feeHead',
                        attributes: ['id', 'fee_head_name', 'is_refundable', 'status', 'bank_id']
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      });

      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found for this reg_no'
        });
      }

      if (!student.groupid) {
        const plain = student.get({ plain: true });
        return res.status(200).json({
          success: true,
          message: 'No fee group assigned to this student',
          data: {
            student: {
              reg_no: plain.reg_no,
              first_name: plain.first_name,
              last_name: plain.last_name,
              class: plain.class,
              division: plain.division,
              feegroupid: plain.feegroupid
            },
            feeGroupDetailPrices: []
          }
        });
      }

      const plain = student.get({ plain: true });
      const feeGroupDetailPrices =
        plain?.feeGroup?.feeGroupDetails?.flatMap((d) => d.feeGroupDetailPrices || []) || [];

      return res.status(200).json({
        success: true,
        data: {
          student: {
            reg_no: plain.reg_no,
            first_name: plain.first_name,
            last_name: plain.last_name,
            class: plain.class,
            division: plain.division,
            feegroupid: plain.feegroupid
          },
          feeGroupDetailPrices
        }
      });
    } catch (error) {
      console.error('getfeeAssignedToStudent:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fee assignment for student',
        error: error.message
      });
    }
  },

  async creategroupDetailAndPricing(req, res) {
    try {
      const { groupdetails, groupPricingRecord } = req.body;

      if (!groupPricingRecord || !Array.isArray(groupPricingRecord) || groupPricingRecord.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'groupPricingRecord must be a non-empty array'
        });
      }
     
      let headdata=groupPricingRecord.map(elem=>{
        return {feeheadid:elem.feehead,groupid:groupdetails.feegroupid}
      })
      console.log('head data*****************************:',headdata)

    await FeeGroupHead.bulkCreate(headdata, {
        validate: true,
        returning: true
      });

      // Step 1: Create Single FeeGroupDetail
    
      const createdFeeGroupDetail = await FeeGroupDetail.create(groupdetails);
       

     

      // Step 2: Map feeGroupDetailId to all pricing records
      const pricingData = groupPricingRecord.map((pricing) => ({
        ...pricing,
        feeheadid:pricing.feehead,
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
