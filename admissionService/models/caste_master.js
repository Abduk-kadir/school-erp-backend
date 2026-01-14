'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class caste_master extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  caste_master.init({
    cast_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'caste_master',
  });
  return caste_master;
};