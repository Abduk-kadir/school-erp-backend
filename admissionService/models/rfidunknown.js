'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RfidUnknown extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  RfidUnknown.init({
    data: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'RfidUnknown',
  });
  return RfidUnknown;
};