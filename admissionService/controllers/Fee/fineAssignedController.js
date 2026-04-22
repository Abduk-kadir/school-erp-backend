const {
  FineAssigned,
  class_master,
  par_student_personal_information,
} = require('../../models');

async function resolveClassIdForFk(body) {
  const raw = body.class_id !== undefined ? body.class_id : body.class;
  if (raw === undefined || raw === '') {
    return { error: 'class_id (or class) is required' };
  }
  const cid = parseInt(raw, 10);
  if (Number.isNaN(cid)) {
    return { error: 'class_id must be a valid number (id from class_masters)' };
  }
  const cls = await class_master.findByPk(cid);
  if (!cls) {
    return {
      error:
        `No class found with id ${cid}. Use GET /api/classes to list valid class ids.`,
    };
  }
  return { class_id: cid };
}

const fineAssignedController = {
  async getAllFineAssigned(req, res) {
    try {
      const rows = await FineAssigned.findAll({
        include: [
          {
            model: class_master,
            as: 'class',
            attributes: ['id', 'class_name', 'class_code'],
          },
          {
            model: par_student_personal_information,
            as: 'student',
            attributes: [
              'id',
              'reg_no',
              'first_name',
              'last_name',
              'father_name',
              'class',
              'division',
            ],
          },
        ],
        order: [['id', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch fine assignments',
        error: error.message,
      });
    }
  },

  async getFineAssignedById(req, res) {
    try {
      const { id } = req.params;

      const row = await FineAssigned.findByPk(id, {
        include: [
          { model: class_master, as: 'class' },
          { model: par_student_personal_information, as: 'student' },
        ],
      });

      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Fine assignment not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: row,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  async createFineAssigned(req, res) {
    try {
      const {
        student_reg_no,
        fine_for_month,
        fine_amount,
        fine_pay_till_date,
        remark,
      } = req.body;

      if (
        student_reg_no === undefined ||
        student_reg_no === null ||
        fine_amount === undefined ||
        fine_amount === null
      ) {
        return res.status(400).json({
          success: false,
          message: 'student_reg_no and fine_amount are required',
        });
      }

      const resolved = await resolveClassIdForFk(req.body);
      if (resolved.error) {
        return res.status(400).json({ success: false, message: resolved.error });
      }

      const student = await par_student_personal_information.findOne({
        where: { reg_no: student_reg_no },
      });
      if (!student) {
        return res.status(400).json({
          success: false,
          message:
            'student_reg_no does not match any par_student_personal_information.reg_no',
        });
      }

      const row = await FineAssigned.create({
        class_id: resolved.class_id,
        student_reg_no,
        fine_for_month: fine_for_month ?? null,
        fine_amount,
        fine_pay_till_date: fine_pay_till_date ?? null,
        remark: remark ?? null,
      });

      return res.status(201).json({
        success: true,
        message: 'Fine assignment created successfully',
        data: row,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create fine assignment',
        error: error.message,
      });
    }
  },

  async updateFineAssigned(req, res) {
    try {
      const { id } = req.params;
      const {
        student_reg_no,
        fine_for_month,
        fine_amount,
        fine_pay_till_date,
        remark,
      } = req.body;

      const row = await FineAssigned.findByPk(id);
      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Fine assignment not found',
        });
      }

      let nextClassId = row.class_id;
      if (
        req.body.class_id !== undefined ||
        req.body.class !== undefined
      ) {
        const resolved = await resolveClassIdForFk(req.body);
        if (resolved.error) {
          return res.status(400).json({ success: false, message: resolved.error });
        }
        nextClassId = resolved.class_id;
      }

      let nextRegNo = row.student_reg_no;
      if (student_reg_no !== undefined) {
        const student = await par_student_personal_information.findOne({
          where: { reg_no: student_reg_no },
        });
        if (!student) {
          return res.status(400).json({
            success: false,
            message:
              'student_reg_no does not match any par_student_personal_information.reg_no',
          });
        }
        nextRegNo = student_reg_no;
      }

      await row.update({
        class_id: nextClassId,
        student_reg_no: nextRegNo,
        fine_for_month:
          fine_for_month !== undefined ? fine_for_month : row.fine_for_month,
        fine_amount: fine_amount !== undefined ? fine_amount : row.fine_amount,
        fine_pay_till_date:
          fine_pay_till_date !== undefined
            ? fine_pay_till_date
            : row.fine_pay_till_date,
        remark: remark !== undefined ? remark : row.remark,
      });

      const updated = await FineAssigned.findByPk(id, {
        include: [
          { model: class_master, as: 'class' },
          { model: par_student_personal_information, as: 'student' },
        ],
      });

      return res.status(200).json({
        success: true,
        message: 'Fine assignment updated successfully',
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update fine assignment',
        error: error.message,
      });
    }
  },

  async deleteFineAssigned(req, res) {
    try {
      const { id } = req.params;

      const row = await FineAssigned.findByPk(id);
      if (!row) {
        return res.status(404).json({
          success: false,
          message: 'Fine assignment not found',
        });
      }

      await row.destroy();

      return res.status(200).json({
        success: true,
        message: 'Fine assignment deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete fine assignment',
        error: error.message,
      });
    }
  },
};

module.exports = fineAssignedController;
