'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class document_types extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  document_types.init({
    name: DataTypes.STRING,
    is_mandatory: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'document_types',
  });
  return document_types;
};