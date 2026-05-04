'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StaffRegistration extends Model {
    static associate() {}
  }

  StaffRegistration.init(
    {
      surname: DataTypes.STRING,
      firstname: DataTypes.STRING,
      lastname: DataTypes.STRING,
      dob: DataTypes.DATEONLY,
      gender: DataTypes.STRING,
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      mobile_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      department: DataTypes.STRING,
      designation: DataTypes.STRING,
      userType: DataTypes.STRING,
      address: DataTypes.TEXT,
      date_of_join: DataTypes.DATEONLY,
      emergency_contact_number: DataTypes.STRING,
      password: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'StaffRegistration'
    }
  );

  return StaffRegistration;
};
