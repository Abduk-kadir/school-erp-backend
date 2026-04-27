const { par_student_personal_information } = require('../models');

const ParmanentPersonalInformation = {
  async create(req, res) {
    try {
      const {
        reg_no,
        first_name,
        last_name,
        father_name,
        class: classId,
        feegroupid,
        division,
        contact_number,
        password,
        dob,
        blood_groop,
      } = req.body;

      const row = await par_student_personal_information.create({
        reg_no,
        first_name,
        last_name,
        father_name,
        class: classId,
        feegroupid,
        division,
        contact_number,
        password,
        dob,
        blood_groop,
      });

      res.status(201).json({ message: 'Created', data: row });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async getAll(req, res) {
    try {
      const q = req.query;
      const where = {};

      if (q.class !== undefined && q.class !== '') {
        where.class = parseInt(q.class, 10);
      }
      if (q.reg_no !== undefined && q.reg_no !== '') {
        where.reg_no = q.reg_no;
      }
      if (q.division !== undefined && q.division !== '') {
        where.division = parseInt(q.division, 10);
      }
      if (q.feegroupid !== undefined && q.feegroupid !== '') {
        where.feegroupid = parseInt(q.feegroupid, 10);
      }

      const rows = await par_student_personal_information.findAll({
        where: Object.keys(where).length ? where : {},
      });
      res.status(200).json({ data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async getByReg(req, res) {
    try {
      const regNoParam = req.params.reg_no ?? req.params.regNo;
      const reg_no = Number(regNoParam);
      if (!Number.isFinite(reg_no)) return res.status(400).json({ message: 'reg_no is required' });

      const row = await par_student_personal_information.findOne({ where: { reg_no } });
      if (!row) return res.status(404).json({ message: 'Student not found',success:false });
      res.status(200).json({message:"student is found", data: row,success:true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error',success:false, error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const {
        reg_no,
        first_name,
        last_name,
        father_name,
        class: classId,
        feegroupid,
        division,
        contact_number,
        password,
        dob,
        blood_groop,
      } = req.body;

      const row = await par_student_personal_information.findByPk(id);
      if (!row) return res.status(404).json({ message: 'Not found' });

      await row.update({
        reg_no,
        first_name,
        last_name,
        father_name,
        class: classId,
        feegroupid,
        division,
        contact_number,
        password,
        dob,
        blood_groop,
      });

      res.status(200).json({ message: 'Updated', data: row });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      const row = await par_student_personal_information.findByPk(id);
      if (!row) return res.status(404).json({ message: 'Not found' });

      await row.destroy();
      res.status(200).json({ message: 'Deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
};

module.exports = ParmanentPersonalInformation;
