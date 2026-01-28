'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DocumentRequirement extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DocumentRequirement.belongsTo(models.document_types, {
        foreignKey: 'document_type_id',
        as: 'documentType',
      });
      DocumentRequirement.belongsTo(models.class_master, {
        foreignKey: 'class_id',
        as: 'class',
      });
      DocumentRequirement.belongsTo(models.Category, {
        foreignKey: 'category_id',
        as: 'category',
      });

    }
  }
  DocumentRequirement.init({
    document_type_id: DataTypes.INTEGER,
    class_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER,
    condition_attribute:DataTypes.STRING,
    condition_value:DataTypes.STRING,
    is_mandatory: DataTypes.BOOLEAN,
    notes: DataTypes.TEXT,
    academic_year: DataTypes.STRING,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'DocumentRequirement',
  });
  return DocumentRequirement;
};