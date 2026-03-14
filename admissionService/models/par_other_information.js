'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class par_other_information extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  par_other_information.init({
    reg_no: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'par_other_information',
  });
  return par_other_information;
};