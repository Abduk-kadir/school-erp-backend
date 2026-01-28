const { Subject } = require('../models'); // adjust path if needed
const {getDataTable}=require('../helper')

const subjectController = {
  // GET /subjects - Get all subjects
  getAllSubjects: async (req, res) => {
    try {
      
     const subjects = await getDataTable(req, Subject, ['value','subject_code','abbreviation_name','subject_pattern','status']);
      return res.json(subjects);
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching subjects',
        error: error.message
      });
    }
  },

  // GET /subjects/:id - Get single subject
  getSubjectById: async (req, res) => {
    try {
      const { id } = req.params;
      const subject = await Subject.findByPk(id);

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: subject
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error fetching subject',
        error: error.message
      });
    }
  },

  // POST /subjects - Create new subject
  createSubject: async (req, res) => {
    try {
      const {
        value,
        subject_code,
        abbreviation_name,
        subject_pattern,
        status = 'active'
      } = req.body;

      // Basic validation
      if (!value || !subject_code) {
        return res.status(400).json({
          success: false,
          message: 'Value and subject_code are required'
        });
      }

      const newSubject = await Subject.create({
        value,
        subject_code,
        abbreviation_name,
        subject_pattern,
        status
      });

      return res.status(201).json({
        success: true,
        message: 'Subject created successfully',
        data: newSubject
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error creating subject',
        error: error.message
      });
    }
  },

  // PUT /subjects/:id - Update subject
  updateSubject: async (req, res) => {
    try {
      const { id } = req.params;
      const subject = await Subject.findByPk(id);

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      await subject.update(req.body);

      return res.status(200).json({
        success: true,
        message: 'Subject updated successfully',
        data: subject
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Error updating subject',
        error: error.message
      });
    }
  },

  // DELETE /subjects/:id - Delete subject
  deleteSubject: async (req, res) => {
    try {
      const { id } = req.params;
      const subject = await Subject.findByPk(id);

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      await subject.destroy();

      return res.status(200).json({
        success: true,
        message: 'Subject deleted successfully'
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error deleting subject',
        error: error.message
      });
    }
  },

  // Optional: Get by subject_code
  getSubjectByCode: async (req, res) => {
    try {
      const { code } = req.params;
      const subject = await Subject.findOne({
        where: { subject_code: code }
      });

      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found'
        });
      }

      return res.json({
        success: true,
        data: subject
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
};

module.exports = subjectController;