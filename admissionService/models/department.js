'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class department extends Model {
    static associate(models) {
      department.hasMany(models.StaffRegistration, {
        foreignKey: 'departmentid',
        as: 'staffMembers',
      });
    }
  }

  department.init(
    {
      department_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'department',
      tableName: 'departments',
    }
  );

  return department;
};
