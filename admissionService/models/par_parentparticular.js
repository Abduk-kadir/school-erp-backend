'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class par_parentparticular extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  par_parentparticular.init({
    reg_no: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'par_parentparticular',
  });
  return par_parentparticular;
};