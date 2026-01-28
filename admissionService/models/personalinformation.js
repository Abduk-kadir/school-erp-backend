'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PersonalInformation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PersonalInformation.init({
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    father_name: DataTypes.STRING,
    class: DataTypes.STRING,
    division: DataTypes.STRING,
    contact_number: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    dob: DataTypes.STRING,
    blood_group: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PersonalInformation',
  });
  return PersonalInformation;
};