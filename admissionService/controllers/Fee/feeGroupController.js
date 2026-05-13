const {
  FeeGroup,
  FeeGroupDetail,
  FeeGroupDetailPrice,
  FeeGroupHead,
  FeeHead,
  FeesType,
  PersonalInformation,
  StudentFeeGroupDetailPrice,
  studentfeegroupDetailpriceSplit,
  Subject,
  sequelize
 
} = require('../../models');
const { Op } = require("sequelize");

const feeGroupController = {
  /**
   * Fee assignment for a student: par_student_personal_information → FeeGroup →
   * FeeGroupDetail → FeeGroupDetailPrice (+ FeeHead per row).
   * @route GET .../student/:regNo/assigned-fees
   */




  
  async getfeeAssignedToStudent(req, res) {
      try{
       const regNoParam = req.params.reg_no ?? req.params.regNo;
       let fee_for=req.params.fee_for??req.params.feeFor
       fee_for=Number(fee_for)
       const reg_no = Number(regNoParam);
       if (!Number.isFinite(reg_no)) {
        return res.send({
          message:"reg_no is required",
          success: false,
          
        });
       }

       const isfeeassigned = await StudentFeeGroupDetailPrice.findOne({where:{reg_no:reg_no}})
       if(!isfeeassigned){
        return res.send({
          message:"student fee installment is not assigned",
          success: false,
          
        });
       }
       
       let studentfee=await sequelize.query(
        `select sfp.*,fh.fee_head_name,fgd.fee_for
         from studentfeegroupdetailprices as sfp
         join feeheads as fh on sfp.feeheadid=fh.id
         join feegroupdetailprices as fgdp on fgdp.id=sfp.feegroupdetailpriceid
         join feegroupdetails as fgd on fgd.id=fgdp.groupdetailid
         where reg_no = :reg_no and fgd.fee_for = :fee_for`,
        { replacements: { reg_no,fee_for }, type: sequelize.QueryTypes.SELECT }
      );
      
  
     
       res.send({
        success:true,
        message:"student fee installment is fetched",
        data:studentfee
       })
      }
      catch(error){
          res.send({
            success:false,
            message:error.message
          })
      }
  },

  async getfeeAssignedToStudentSplit(req, res) {
    try{
     const regNoParam = req.params.reg_no ?? req.params.regNo;
     let fee_for = req.params.fee_for ?? req.params.feeFor;
     fee_for = Number(fee_for);
     const reg_no = Number(regNoParam);
     if (!Number.isFinite(reg_no)) {
      return res.send({
        message:"reg_no is required",
        success: false,
        
      });
     }
     if (!Number.isFinite(fee_for)) {
      return res.send({
        message:"fee_for is required",
        success: false,
      });
     }

     const isfeeassigned = await StudentFeeGroupDetailPrice.findOne({where:{reg_no:reg_no}})
     if(!isfeeassigned){
      return res.send({
        message:"student fee installment is not assigned",
        success: false,
        
      });
     }
     
     let studentfee=await sequelize.query(
      ` select sfp.*,fh.fee_head_name,fgd.fee_for,
        splitfee.student_installment_id,
        splitfee.jan_total AS split_jan_total,
        splitfee.jan_split1,
        splitfee.jan_split2,

        splitfee.feb_total AS split_feb_total,
        splitfee.feb_split1,
        splitfee.feb_split2,

        splitfee.mar_total AS split_mar_total,
        splitfee.mar_split1,
        splitfee.mar_split2,

        splitfee.apr_total AS split_apr_total,
        splitfee.apr_split1,
        splitfee.apr_split2,

        splitfee.may_total AS split_may_total,
        splitfee.may_split1,
        splitfee.may_split2,

        splitfee.jun_total AS split_jun_total,
        splitfee.jun_split1,
        splitfee.jun_split2,

        splitfee.jul_total AS split_jul_total,
        splitfee.jul_split1,
        splitfee.jul_split2,

        splitfee.aug_total AS split_aug_total,
        splitfee.aug_split1,
        splitfee.aug_split2,

        splitfee.sep_total AS split_sep_total,
        splitfee.sep_split1,
        splitfee.sep_split2,

        splitfee.oct_total AS split_oct_total,
        splitfee.oct_split1,
        splitfee.oct_split2,

        splitfee.nov_total AS split_nov_total,
        splitfee.nov_split1,
        splitfee.nov_split2,

        splitfee.dec_total AS split_dec_total,
        splitfee.dec_split1,
        splitfee.dec_split2
         from studentfeegroupdetailprices as sfp
         join feeheads as fh on sfp.feeheadid=fh.id
         join feegroupdetailprices as fgdp on fgdp.id=sfp.feegroupdetailpriceid
         join feegroupdetails as fgd on fgd.id=fgdp.groupdetailid
         left join studentfeegroupdetailpricesplits as splitfee
           on splitfee.id = (
             select max(s2.id)
             from studentfeegroupdetailpricesplits as s2
             where s2.student_installment_id = sfp.id
           )
         where reg_no = :reg_no and fgd.fee_for = :fee_for`,
      { replacements: { reg_no,fee_for }, type: sequelize.QueryTypes.SELECT }
    );
    
   
     res.send({
      success:true,
      message:"student fee installment is fetched",
      data:studentfee
     })
    }
    catch(error){
        res.send({
          success:false,
          message:error.message
        })
    }
},

  async getfeeheadsbygroupid(req, res) {
    try {
      const groupIdParam = req.params.groupid ?? req.params.group_id ?? req.params.id;
      const groupid = Number(groupIdParam);

      if (!Number.isFinite(groupid)) {
        return res.status(400).json({
          success: false,
          message: 'groupid is required'
        });
      }

      const data = await sequelize.query(
        `select fgh.feeheadid as id ,fh.fee_head_name
         from feegroupheads as fgh
         join feeheads as fh on fgh.feeheadid=fh.id
         where fgh.groupid = :groupid;`,
        { replacements: { groupid }, type: sequelize.QueryTypes.SELECT }
      );

      return res.status(200).json({
        success: true,
        message: 'Fee heads fetched successfully',
        data
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fee heads',
        error: error.message
      });
    }
  },

  async assignFeeToStudent(req,res){
    try{
      let {reg_no}=req.body;
      let student=await PersonalInformation.findOne({where:{reg_no:reg_no}})
      let gender=student?.gender
      let cast=student?.cast
      let student_type=student?.student_type
      let cl=student?.class
      let fgp = await FeeGroupDetail.findAll({
        where: {
          gender,
          cast,
          isAdded_student:student_type,
          classid: cl
        }
      });

      
      let feegroupdetailid=fgp.map((elem)=>elem.id);
      
      let feegroupdetailprice = await FeeGroupDetailPrice.findAll({
        where: {
          groupdetailid: {
            [Op.in]: feegroupdetailid
          }
        },
        raw: true
      });
    
     
      let allstudentFee = feegroupdetailprice.map((elem) => {
        const { id, groupdetailid,createdAt,updatedAt, ...rest } =elem;
      
        return {
          ...rest,
          reg_no:reg_no,
          feegroupdetailpriceid: id,
          jan_total_paid:0,
          jan_total_due:rest.jan_total || 0,
          feb_total_paid:0,
          feb_total_due:rest.feb_total || 0,
          mar_total_paid:0,
          mar_total_due:rest.mar_total || 0,
          apr_total_paid:0,
          apr_total_due:rest.apr_total || 0,
          may_total_paid:0,
          may_total_due:rest.may_total || 0,
          jun_total_paid:0,
          jun_total_due:rest.jun_total || 0,
          jul_total_paid:0,
          jul_total_due:rest.jul_total || 0,
          aug_total_paid:0,
          aug_total_due:rest.aug_total || 0,
          sep_total_paid:0,
          sep_total_due:rest.sep_total || 0,
          oct_total_paid:0,
          oct_total_due:rest.oct_total || 0,
          nov_total_paid:0,
          nov_total_due:rest.nov_total || 0,
          dec_total_paid:0,
          dec_total_due:rest.dec_total || 0
         
        };
      });

      let updatedstudent = await PersonalInformation.update(
        { groupid: fgp.feegroupid },  
        { where: { reg_no: reg_no } } 
      );
      let createdstudentfee=await StudentFeeGroupDetailPrice.bulkCreate(allstudentFee, {
        validate: true,
        returning: true
      });

      res.send({
        message:"student fee installment is created",
        success:true,
        data:createdstudentfee
        
      })
  
 res.send({
  data:feegroupdetailprice,
  length:feegroupdetailprice.length,
  
 })
     

    }
    catch(error){
      res.send({
        message:error.message,
        success:false,
      })

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
      const { groupname, selectedFeeHeadIds } = req.body;

      if (groupname == null || String(groupname).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'groupname is required'
        });
      }

      if (selectedFeeHeadIds !== undefined && !Array.isArray(selectedFeeHeadIds)) {
        return res.status(400).json({
          success: false,
          message: 'selectedFeeHeadIds must be an array'
        });
      }

      const uniqueFeeHeadIds = Array.isArray(selectedFeeHeadIds)
        ? [...new Set(selectedFeeHeadIds)]
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0)
        : [];

      const feeGroup = await sequelize.transaction(async (t) => {
        const createdFeeGroup = await FeeGroup.create(
          { groupname: String(groupname).trim() },
          { transaction: t }
        );

        if (uniqueFeeHeadIds.length > 0) {
          await FeeGroupHead.bulkCreate(
            uniqueFeeHeadIds.map((feeheadid) => ({
              groupid: createdFeeGroup.id,
              feeheadid
            })),
            { validate: true, transaction: t }
          );
        }

        return createdFeeGroup;
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
  },

  async getAllFeeGroupDetails(req, res) {
    try {
      const feeGroupDetails = await FeeGroupDetail.findAll({
        include: [
          {
            model: FeeGroup,
            as: 'feeGroup',
            attributes: ['groupname'],
            required: false
          },
          {
            model: FeesType,
            as: 'feeType',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: Subject,
            as: 'subject',
            attributes: ['value'],
            required: false
          }
        ],

        order: [['id', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        data: feeGroupDetails
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fee group details',
        error: error.message
      });
    }
  }
};

module.exports = feeGroupController;
