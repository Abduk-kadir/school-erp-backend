const { document_types } = require('../models'); // adjust path if needed
const { Op } = require('sequelize');

class DocumentTypeController {
  // GET /api/document-types
  static async getAll(req, res) {
    try {
      const { search, is_mandatory, page = 1, limit = 20 } = req.query;

      const where = {};

      if (search) {
        where.name = { [Op.like]: `%${search}%` };
      }

      if (is_mandatory !== undefined) {
        where.is_mandatory = is_mandatory === 'true' || is_mandatory === true;
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows } = await document_types.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['name', 'ASC']],
      });

      return res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching document types:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  // GET /api/document-types/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const docType = await document_types.findByPk(id);

      if (!docType) {
        return res.status(404).json({
          success: false,
          message: 'Document type not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: docType,
      });
    } catch (error) {
      console.error('Error fetching document type:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  // POST /api/document-types
  static async create(req, res) {
    try {
      const { name, is_mandatory = false } = req.body;

      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Name is required and must be a non-empty string',
        });
      }

      const existing = await document_types.findOne({ where: { name: name.trim() } });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Document type with this name already exists',
        });
      }

      const newDocType = await document_types.create({
        name: name.trim(),
        is_mandatory: !!is_mandatory,
      });

      return res.status(201).json({
        success: true,
        message: 'Document type created successfully',
        data: newDocType,
      });
    } catch (error) {
      console.error('Error creating document type:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  // PUT /api/document-types/:id
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { name, is_mandatory } = req.body;

      const docType = await document_types.findByPk(id);

      if (!docType) {
        return res.status(404).json({
          success: false,
          message: 'Document type not found',
        });
      }

      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Name must be a non-empty string',
          });
        }

        // Check for name conflict (excluding self)
        const existing = await document_types.findOne({
          where: {
            name: name.trim(),
            id: { [Op.ne]: id },
          },
        });

        if (existing) {
          return res.status(409).json({
            success: false,
            message: 'Another document type with this name already exists',
          });
        }

        docType.name = name.trim();
      }

      if (is_mandatory !== undefined) {
        docType.is_mandatory = !!is_mandatory;
      }

      await docType.save();

      return res.status(200).json({
        success: true,
        message: 'Document type updated successfully',
        data: docType,
      });
    } catch (error) {
      console.error('Error updating document type:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }

  // DELETE /api/document-types/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const docType = await document_types.findByPk(id);

      if (!docType) {
        return res.status(404).json({
          success: false,
          message: 'Document type not found',
        });
      }

      // Optional: check if it's used in document_requirements before delete
      // const count = await models.DocumentRequirement.count({
      //   where: { document_type_id: id }
      // });
      // if (count > 0) {
      //   return res.status(409).json({ message: 'Cannot delete - type is in use' });
      // }

      await docType.destroy();

      return res.status(200).json({
        success: true,
        message: 'Document type deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting document type:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message,
      });
    }
  }
}

module.exports = DocumentTypeController;