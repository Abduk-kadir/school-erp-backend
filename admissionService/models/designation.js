'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class designation extends Model {
    static associate(models) {
      designation.hasMany(models.StaffRegistration, {
        foreignKey: 'designationid',
        as: 'staffMembers',
      });
    }
  }

  designation.init(
    {
      designation_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'designation',
      tableName: 'designations',
    }
  );

  return designation;
};
