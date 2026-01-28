const { DocumentRequirement, class_master,document_types,Category } = require('../models');
const { Op, where } = require('sequelize');

async function getAll(req, res) {
  let { class_id } = req.query;
  console.log('class id is:', class_id);

  // Always declare where first (empty object = no filter)
  const where = {};

  // Only add the class filter when class_id is provided
  if (class_id && class_id.trim() !== '') {
    where.class_id = Number(class_id);   // strict match only for that class
    // If you want universal docs too → use this instead:
    // where[Op.or] = [
    //   { class_id: Number(class_id) },
    //   { class_id: null }
    // ];
  }

  console.log('where query is:', where);
  try {
    const documents = await DocumentRequirement.findAll({
      
      include: [
        {
          model: class_master,
          as: 'class',
          attributes: ['id', 'class_name'], // ← optional: select only needed fields
        },
        {
          model: document_types,
          as: 'documentType',
          attributes: ['id', 'name'], // ← adjust as needed
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'], // ← adjust as needed
        },
      ],
   raw: true,
   nest: true,
    });
    const formatted = documents.map((doc) => ({
id: doc.id,
class_name: doc.class.class_name,
document_type: doc.documentType.name,
category: doc.category.name,
condition_attribute:doc.condition_attribute,
condition_value:doc.condition_value,
is_mandatory: doc.is_mandatory,
}));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error in getAll DocumentRequirements:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch requirement documents',
      error: error.message,
      stack: error.stack, // ← helpful during debugging
    });
  }
}
// GET /api/requirement-documents/:id
async function getById(req, res) {
  try {
   
    
    const doc = await DocumentRequirement.findByPk(id, {
      include: [
        {
          model: class_master,
          as: 'class',
          attributes: ['id', 'class_name'],
        },
      ],
    });

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Requirement document not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
}

// POST /api/requirement-documents
async function create(req, res) {
  try {
    console.log('hi arman')
    const {document_type_id, class_id, category_id, condition_attribute,condition_value, is_mandatory } = req.body;
    const newDoc = await DocumentRequirement.create({
      class_id, 
      document_type_id,         
      category_id,
      condition_attribute,
      condition_value,
      is_mandatory, // default false
    });

    return res.status(201).json({
      success: true,
      data: newDoc,
    });
  } catch (error) {
   
    return res.status(500).json({
      success: false,
      message: 'Failed to create requirement document',
      error: error.message,
    });
  }
}

// PATCH /api/requirement-documents/:id
async function update(req, res) {
  try {
    const { id } = req.params;
    const { class_id, table_name, table_primary, is_complusry } = req.body;

    const doc = await DocumentRequirement.findByPk(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Requirement document not found',
      });
    }

    await doc.update({
      class_id: class_id ?? doc.class_id,
      table_name: table_name ?? doc.table_name,
      table_primary: table_primary ?? doc.table_primary,
      is_complusry: is_complusry ?? doc.is_complusry,
    });

    const updated = await DocumentRequirement.findByPk(id, {
      include: [{ model: class_master, as: 'class' }],
    });

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update',
      error: error.message,
    });
  }
}

// DELETE /api/requirement-documents/:id
async function remove(req, res) {
  try {
    const { id } = req.params;

    const doc = await DocumentRequirement.findByPk(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Requirement document not found',
      });
    }

    await doc.destroy();

    return res.status(200).json({
      success: true,
      message: 'Requirement document deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete requirement document',
      error: error.message,
    });
  }
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};