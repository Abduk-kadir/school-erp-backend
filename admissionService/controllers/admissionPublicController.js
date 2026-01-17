const { Stage, Field, FieldType, FieldOption } = require('../models');

exports.getFullFormStructure = async (req, res) => {
  try {
    const stages = await Stage.findAll({
      attributes: ['id', 'name', 'description', 'order'],
      order: [['order', 'ASC']],
      include: [
        {
          model: Field,
          as: 'fields',
          attributes: [
            'id', 'name', 'label', 'isRequired', 'placeholder',
            'defaultValue', 'validationRules', 'order', 'fieldTypeId'
          ],
          order: [['order', 'ASC']],
          include: [
            {
              model: FieldType,
              as: 'fieldType',
              attributes: ['typeName'],
            },
            {
              model: FieldOption,
              as: 'options',
              attributes: ['id', 'value', 'label', 'order'],
              order: [['order', 'ASC']],
            },
          ],
        },
      ],
    });

    const formatted = stages.map(stage => ({
      id: stage.id,
      name: stage.name,
      description: stage.description || '',
      order: stage.order,
      fields: stage.fields.map(field => ({
        id: field.id,
        name: field.name,
        label: field.label,
        type: field.fieldType?.typeName || 'text',
        isRequired: field.isRequired,
        placeholder: field.placeholder || '',
        defaultValue: field.defaultValue || '',
        validationRules: field.validationRules || {},
        order: field.order,
        options: field.options.map(opt => ({
          id: opt.id,
          value: opt.value,
          label: opt.label,
          order: opt.order,
        })),
      })),
    }));

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load admission form structure',
    });
  }
};