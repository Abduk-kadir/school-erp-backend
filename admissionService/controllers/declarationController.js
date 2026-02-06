const { Declaration, class_master } = require('../models');
const { Op, where } = require('sequelize');

// 1. Create a new declaration
const createDeclaration = async (req, res) => {
  try {
    const { class_id, content } = req.body;

    if (!class_id || !content) {
      return res.status(400).json({
        success: false,
        message: 'class_id and content are required',
      });
    }

    // Optional: Validate class exists
    const classExists = await class_master.findByPk(class_id);
    if (!classExists) {
      return res.status(404).json({
        success: false,
        message: 'Class not found',
      });
    }

    const declaration = await Declaration.create({
      class_id,
      content,
    });

    return res.status(201).json({
      success: true,
      message: 'Declaration created successfully',
      data: declaration,
    });
  } catch (error) {
    console.error('Error creating declaration:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating declaration',
      error: error.message,
    });
  }
};

// 2. Get all declarations (with optional class filter)
const getAllDeclarations = async (req, res) => {
  try {
    const { class_id } = req.query;

    const where = {};
    if (class_id) {
      where.class_id = class_id;
    }

    const declarations = await Declaration.findAll({
      where,
      include: [
        {
          model: class_master,
          as: 'class',
          attributes: ['id', 'class_name', 'section'], // adjust fields as needed
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count: declarations.length,
      data: declarations,
    });
  } catch (error) {
    console.error('Error fetching declarations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching declarations',
      error: error.message,
    });
  }
};

// 3. Get single declaration by ID
const getDeclarationByClassId = async (req, res) => {
  try {
    const { classId } = req.params;

    const declaration = await Declaration.findOne({
      where:{class_id:classId},
      
      include: [
        {
          model: class_master,
          as: 'class',
          attributes: ['class_name']
         
        },
      ],
      
    });

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Declaration not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: declaration,
    });
  } catch (error) {
    console.error('Error fetching declaration:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching declaration',
      error: error.message,
    });
  }
};

// 4. Update declaration
const updateDeclaration = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id, content } = req.body;

    const declaration = await Declaration.findByPk(id);

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Declaration not found',
      });
    }

    // Optional: validate class if being updated
    if (class_id) {
      const classExists = await class_master.findByPk(class_id);
      if (!classExists) {
        return res.status(404).json({
          success: false,
          message: 'Class not found',
        });
      }
    }

    await declaration.update({
      class_id: class_id || declaration.class_id,
      content: content || declaration.content,
    });

    // Fetch updated record with class info
    const updatedDeclaration = await Declaration.findByPk(id, {
      include: [{ model: class_master, as: 'class' }],
    });

    return res.status(200).json({
      success: true,
      message: 'Declaration updated successfully',
      data: updatedDeclaration,
    });
  } catch (error) {
    console.error('Error updating declaration:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating declaration',
      error: error.message,
    });
  }
};

// 5. Delete declaration
const deleteDeclaration = async (req, res) => {
  try {
    const { id } = req.params;

    const declaration = await Declaration.findByPk(id);

    if (!declaration) {
      return res.status(404).json({
        success: false,
        message: 'Declaration not found',
      });
    }

    await declaration.destroy();

    return res.status(200).json({
      success: true,
      message: 'Declaration deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting declaration:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting declaration',
      error: error.message,
    });
  }
};

module.exports = {
  createDeclaration,
  getAllDeclarations,
  getDeclarationByClassId,
  updateDeclaration,
  deleteDeclaration,
};