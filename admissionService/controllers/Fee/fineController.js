const { Fine, class_master,FineAssigned } = require('../../models');
const asyncHandler = require('express-async-handler')

const VALID_FINE_TYPES = ['daily', 'weekly', 'monthly', 'onetime'];

const fineController = {
  async getAllFines(req, res) {
    try {
      const fines = await Fine.findAll({
        include: [
          {
            model: class_master,
            as: 'class',
            attributes: ['id', 'class_name', 'class_code'],
          },
        ],
        order: [['id', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: fines,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fines',
        error: error.message,
      });
    }
  },

  async getFineById(req, res) {
    try {
      const { id } = req.params;

      const fine = await Fine.findByPk(id, {
        include: [{ model: class_master, as: 'class' }],
      });

      if (!fine) {
        return res.status(404).json({
          success: false,
          message: 'Fine not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: fine,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  async createFine(req, res) {
    try {
      const { class_id, fine_for_month, fine_type, fine_start_date, fine_amount } =
        req.body;

      if (!class_id || fine_amount === undefined || fine_amount === null) {
        return res.status(400).json({
          success: false,
          message: 'class_id and fine_amount are required',
        });
      }

      if (!fine_type || !VALID_FINE_TYPES.includes(fine_type)) {
        return res.status(400).json({
          success: false,
          message: `fine_type must be one of: ${VALID_FINE_TYPES.join(', ')}`,
        });
      }

      const fine = await Fine.create({
        class_id,
        fine_for_month: fine_for_month ?? null,
        fine_type,
        fine_start_date: fine_start_date ?? null,
        fine_amount,
      });

      return res.status(201).json({
        success: true,
        message: 'Fine created successfully',
        data: fine,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create fine',
        error: error.message,
      });
    }
  },

  async updateFine(req, res) {
    try {
      const { id } = req.params;
      const { class_id, fine_for_month, fine_type, fine_start_date, fine_amount } =
        req.body;

      const fine = await Fine.findByPk(id);
      if (!fine) {
        return res.status(404).json({
          success: false,
          message: 'Fine not found',
        });
      }

      if (fine_type !== undefined && !VALID_FINE_TYPES.includes(fine_type)) {
        return res.status(400).json({
          success: false,
          message: `fine_type must be one of: ${VALID_FINE_TYPES.join(', ')}`,
        });
      }

      await fine.update({
        class_id: class_id !== undefined ? class_id : fine.class_id,
        fine_for_month:
          fine_for_month !== undefined ? fine_for_month : fine.fine_for_month,
        fine_type: fine_type !== undefined ? fine_type : fine.fine_type,
        fine_start_date:
          fine_start_date !== undefined ? fine_start_date : fine.fine_start_date,
        fine_amount: fine_amount !== undefined ? fine_amount : fine.fine_amount,
      });

      const updated = await Fine.findByPk(id, {
        include: [{ model: class_master, as: 'class' }],
      });

      return res.status(200).json({
        success: true,
        message: 'Fine updated successfully',
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update fine',
        error: error.message,
      });
    }
  },

  async deleteFine(req, res) {
    try {
      const { id } = req.params;

      const fine = await Fine.findByPk(id);
      if (!fine) {
        return res.status(404).json({
          success: false,
          message: 'Fine not found',
        });
      }

      await fine.destroy();

      return res.status(200).json({
        success: true,
        message: 'Fine deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete fine',
        error: error.message,
      });
    }
  },

  async calculateFine(req, res) {
    try {
      const { class_id,reg_no,date} = req.body;

     let fineAssigned=await FineAssigned.findAll({where:{student_reg_no:reg_no},raw:true})
    
      const current_date = date?new Date(date):new Date();
      const fineall = await Fine.findAll({ where: { class_id } });

        let newallFine = fineall.map((elem) => {
        const plain = typeof elem.get === 'function' ? elem.get({ plain: true }) : { ...elem };
        const start = elem.fine_start_date ? new Date(elem.fine_start_date) : null;
        const amount = Number(elem.fine_amount);

        if (start && start > current_date) {
          return { ...plain, finalFine: 0 };
        }

        if (elem.fine_type === 'onetime') {
          return { ...plain, finalFine: amount };
        }

        if (!start) {
          return { ...plain, finalFine: 0 };
        }

        const diffMs = current_date - start;
        if (diffMs < 0) {
          return { ...plain, finalFine: 0 };
        }

        if (elem.fine_type === 'daily') {
          const days = Math.floor(diffMs / 86400000);
          return { ...plain, finalFine: days * amount };
        }
        if (elem.fine_type === 'weekly') {
          const weeks = Math.floor(diffMs / 604800000);
          return { ...plain, finalFine: weeks * amount };
        }
        if (elem.fine_type === 'monthly') {
          const MS_PER_30_DAYS = 30 * 86400000;
          const months = Math.floor(diffMs / MS_PER_30_DAYS);
          return { ...plain, finalFine: months * amount };
        }

        return { ...plain, finalFine: 0 };
      });

      newallFine=newallFine.map((elem)=>{
        let f=fineAssigned.find((fine)=>fine.fine_for_month===elem.fine_for_month)
        if(f){
          console.log('f date is********',new Date(f.fine_pay_till_date))
          console.log('current date is********',current_date)
          console.log('f date greater than current date',new Date(f.fine_pay_till_date)>current_date)
        }

       
        return {
          ...elem,
          assignedFine:f?f.fine_amount:0,
          
          finalFine:f?new Date(f.fine_pay_till_date)>current_date?f.fine_amount:elem.finalFine:elem.finalFine
        }
      })

      return res.status(200).json({
        success: true,
        data: newallFine,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to calculate fine',
        error: error.message,
      });
    }
  },
};


module.exports = fineController;
