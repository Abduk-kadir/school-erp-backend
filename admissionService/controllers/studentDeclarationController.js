const { student_declaration, Declaration } = require('../models');

const student_declarationController = {
  // Create / Submit declaration acceptance
  async create(req, res) {
    try {
      const { reg_no, declaration_id, accepted, location } = req.body;

      if (!reg_no || !declaration_id) {
        return res.status(400).json({ message: 'reg_no and declaration_id are required' });
      }

      const declaration = await student_declaration.create({
        reg_no,
        declaration_id,
        accepted: accepted ?? false,
        location: location || null,
        date: new Date(),
      });

      return res.status(201).json({
        message: 'Declaration submitted successfully',
        data: declaration,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get one student's declaration status
  async getByRegNo(req, res) {
    console.log('calling api')
    try {
      const { reg_no } = req.params;

      const records = await student_declaration.findOne({
        where: { reg_no },
        include: [
          {
            model: Declaration,
            as: 'declaration',
            attributes: ['id', 'content'],
          },
        ],
      
      });
      if (!records) {
        return res.status(404).json({ success: false, message: 'No declaration found for this student' });
      }
      return res.json({
         message: 'Declaration found successfully',
         success: true,
         data: records,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

  // Get single record by ID
  async getOne(req, res) {
     console.log('calling api')
    try {
      const { id } = req.params;
      

      const record = await student_declaration.findByPk(id, {
        include: [{ model: Declaration, as: 'declaration' }],
      });

      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }

      return res.json(record);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },

  // Update (e.g. change accepted status or location)
  async update(req, res) {
    try {
      const { id } = req.params;
      const { accepted, location , date} = req.body;

      const record = await student_declaration.findByPk(id);
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }

      await record.update({
        accepted: accepted !== undefined ? accepted : record.accepted,
        location: location !== undefined ? location : record.location,
        date: date !== undefined ? date : record.date,
      });

      return res.json({ message: 'Updated successfully', data: record });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
};

module.exports = student_declarationController;