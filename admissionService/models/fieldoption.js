'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FieldOption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     FieldOption.belongsTo(models.Field, {
        foreignKey: 'fieldId',
        as: 'field',
      });
    }
  }
  FieldOption.init({
    fieldId: DataTypes.INTEGER,
    value: DataTypes.STRING,
    label: DataTypes.STRING,
    order: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'FieldOption',
  });
  return FieldOption;
};