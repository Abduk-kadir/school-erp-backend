'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class staffclassmap extends Model {
    static associate(models) {
      staffclassmap.belongsTo(models.StaffRegistration, {
        foreignKey: 'staffid',
        as: 'staffInfo',
      });
      staffclassmap.belongsTo(models.class_master, {
        foreignKey: 'classid',
        as: 'classInfo',
      });
      staffclassmap.belongsTo(models.division_master, {
        foreignKey: 'divisionid',
        as: 'divisionInfo',
      });
    }
  }

  staffclassmap.init(
    {
      staffid: DataTypes.INTEGER,
      classid: DataTypes.INTEGER,
      divisionid: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'staffclassmap',
      tableName: 'staffclassmaps',
    }
  );

  return staffclassmap;
};
