const { studentfine, class_master, par_student_personal_information } = require('../../models');

const studentfineController = {
  async getAll(req, res) {
    try {
      const rows = await studentfine.findAll({
        include: [
          {
            model: class_master,
            as: 'classInfo',
            attributes: ['id', 'class_name', 'class_code'],
          },
          {
            model: par_student_personal_information,
            as: 'student',
            attributes: ['id', 'reg_no', 'first_name', 'last_name', 'class'],
          },
        ],
        order: [['id', 'DESC']],
      });
      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch student fines',
        error: error.message,
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const row = await studentfine.findByPk(id, {
        include: [
          { model: class_master, as: 'classInfo' },
          { model: par_student_personal_information, as: 'student' },
        ],
      });
      if (!row) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }
      return res.status(200).json({ success: true, data: row });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  },

  async create(req, res) {
    try {
      const {
        reg_no,
        class: classId,
        actualfineamount,
        assignedfineamount,
        paidfineamount,
        date,
        reciept_no,
      } = req.body;

      if (reg_no === undefined || reg_no === null || classId === undefined || classId === null) {
        return res.status(400).json({
          success: false,
          message: 'reg_no and class are required',
        });
      }

      const row = await studentfine.create({
        reg_no,
        class: classId,
        actualfineamount: actualfineamount ?? null,
        assignedfineamount: assignedfineamount ?? null,
        paidfineamount: paidfineamount ?? null,
        date: date ?? null,
        reciept_no: reciept_no ?? null,
      });

      return res.status(201).json({
        success: true,
        message: 'Created successfully',
        data: row,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create',
        error: error.message,
      });
    }
  },

  async bulkCreate(req, res) {
    try {
      const { records } = req.body;
      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'records must be a non-empty array',
        });
      }

      const rowsPayload = [];
      for (let i = 0; i < records.length; i++) {
        const item = records[i];
        const classId = item.class;
        if (item.reg_no === undefined || item.reg_no === null || classId === undefined || classId === null) {
          return res.status(400).json({
            success: false,
            message: `reg_no and class are required for each record (index ${i})`,
          });
        }
        rowsPayload.push({
          reg_no: item.reg_no,
          class: classId,
          actualfineamount: item.actualfineamount ?? null,
          assignedfineamount: item.assignedfineamount ?? null,
          paidfineamount: item.paidfineamount ?? null,
          date: item.date ?? null,
          reciept_no: item.reciept_no ?? null,
          month: item.month ?? null,
          fee_table_id: item.fee_table_id ?? null,
        });
      }

      const created = await studentfine.bulkCreate(rowsPayload);

      return res.status(201).json({
        success: true,
        message: 'Created successfully',
        count: created.length,
        data: created,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to bulk create',
        error: error.message,
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        reg_no,
        class: classId,
        actualfineamount,
        assignedfineamount,
        paidfineamount,
        date,
        reciept_no,
      } = req.body;

      const row = await studentfine.findByPk(id);
      if (!row) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }

      await row.update({
        reg_no: reg_no !== undefined ? reg_no : row.reg_no,
        class: classId !== undefined ? classId : row.class,
        actualfineamount:
          actualfineamount !== undefined ? actualfineamount : row.actualfineamount,
        assignedfineamount:
          assignedfineamount !== undefined ? assignedfineamount : row.assignedfineamount,
        paidfineamount:
          paidfineamount !== undefined ? paidfineamount : row.paidfineamount,
        date: date !== undefined ? date : row.date,
        reciept_no: reciept_no !== undefined ? reciept_no : row.reciept_no,
      });

      const updated = await studentfine.findByPk(id, {
        include: [
          { model: class_master, as: 'classInfo' },
          { model: par_student_personal_information, as: 'student' },
        ],
      });

      return res.status(200).json({
        success: true,
        message: 'Updated successfully',
        data: updated,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update',
        error: error.message,
      });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const row = await studentfine.findByPk(id);
      if (!row) {
        return res.status(404).json({ success: false, message: 'Record not found' });
      }
      await row.destroy();
      return res.status(200).json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete',
        error: error.message,
      });
    }
  },
};

module.exports = studentfineController;
