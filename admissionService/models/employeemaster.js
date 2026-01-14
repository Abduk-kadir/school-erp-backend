'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EmployeeMaster extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EmployeeMaster.init({
    name: DataTypes.STRING,
    father_name: DataTypes.STRING,
    husband_wife_name: DataTypes.STRING,
    sir_name: DataTypes.STRING,
    dob: DataTypes.DATEONLY,
    mobile_number: DataTypes.STRING,
    rfid: DataTypes.STRING,
    gender: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EmployeeMaster',
  });
  return EmployeeMaster;
};