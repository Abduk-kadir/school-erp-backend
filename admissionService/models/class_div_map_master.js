'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class class_div_map_master extends Model {
    static associate(models) {
      class_div_map_master.belongsTo(models.class_master, {
        foreignKey: 'classid',
        as: 'classInfo',
      });
      class_div_map_master.belongsTo(models.division_master, {
        foreignKey: 'divisionid',
        as: 'divisionInfo',
      });
    }
  }

  class_div_map_master.init(
    {
      classid: DataTypes.INTEGER,
      divisionid: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'class_div_map_master',
      tableName: 'class_div_map_masters',
    }
  );

  return class_div_map_master;
};
