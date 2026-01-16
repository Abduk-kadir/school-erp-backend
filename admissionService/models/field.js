'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Field extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Field.belongsTo(models.Stage, {
        foreignKey: 'stageId',
        as: 'stage',
      });

      // Field belongs to one FieldType
      Field.belongsTo(models.FieldType, {
        foreignKey: 'fieldTypeId',
        as: 'fieldType',
      });

      // Field has many FieldOptions (for dropdown, radio, etc.)
      Field.hasMany(models.FieldOption, {
        foreignKey: 'fieldId',
        as: 'options',
        onDelete: 'CASCADE',
      });
    }
  }
  Field.init({
    stageId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    label: DataTypes.STRING,
    fieldTypeId: DataTypes.INTEGER,
    isRequired: DataTypes.BOOLEAN,
    placeholder: DataTypes.STRING,
    defaultValue: DataTypes.STRING,
    validationRules: DataTypes.JSON,
    order: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Field',
  });
  return Field;
};