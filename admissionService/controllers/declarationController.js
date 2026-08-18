const asyncHandler = require('express-async-handler');
const { Declaration, class_master } = require('../models');
const { Op, where } = require('sequelize');
const { getDataTable } = require('../helper');

// 1. Create a new declaration
const createDeclaration = asyncHandler(async (req, res) => {
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
});

// 2. Get all declarations (with optional class filter)
const getAllDeclarations = asyncHandler(async (req, res) => {
  const { class_id } = req.query;

  const where = {};
  if (class_id) {
    where.class_id = class_id;
  }
  /*
  const declarations = await Declaration.findAll({
    where,
    include: [
      {
        model: class_master,
        as: 'class',
        attributes: ['id', 'class_name'], // adjust fields as needed
      },
    ],
    order: [['createdAt', 'DESC']],
  });

  return res.status(200).json({
    success: true,
    count: declarations.length,
    data: declarations,
  });
  */
  const result = await getDataTable(
    req,
     Declaration,
      ['content'],
      where,
      [
        {
          model: class_master,
          as: 'class',
          attributes: ['id', 'class_name'], // adjust fields as needed
        }
      ]);
  res.json(result);

});

// 3. Get single declaration by ID
const getDeclarationByClassId = asyncHandler(async (req, res) => {
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
});

// 4. Update declaration
const updateDeclaration = asyncHandler(async (req, res) => {
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
});

// 5. Delete declaration
const deleteDeclaration = asyncHandler(async (req, res) => {
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
});

module.exports = {
  createDeclaration,
  getAllDeclarations,
  getDeclarationByClassId,
  updateDeclaration,
  deleteDeclaration,
};
