'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StaffRegistration extends Model {
    static associate(models) {
      StaffRegistration.belongsTo(models.department, {
        foreignKey: 'departmentid',
        as: 'departmentInfo',
      });
      StaffRegistration.belongsTo(models.designation, {
        foreignKey: 'designationid',
        as: 'designationInfo',
      });
    }
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
      departmentid: DataTypes.INTEGER,
      designationid: DataTypes.INTEGER,
      userType: DataTypes.STRING,
      address: DataTypes.TEXT,
      date_of_join: DataTypes.DATEONLY,
      emergency_contact_number: DataTypes.STRING,
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      staff_photo: DataTypes.STRING,
      staff_sig_photo: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'StaffRegistration'
    }
  );

  return StaffRegistration;
};
