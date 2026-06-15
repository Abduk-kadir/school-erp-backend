'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class holidarmaster extends Model {
    static associate(models) {
      holidarmaster.belongsTo(models.class_master, {
        foreignKey: 'class',
        as: 'classInfo',
      });
      holidarmaster.belongsTo(models.division_master, {
        foreignKey: 'division',
        as: 'divisionInfo',
      });
    }
  }

  holidarmaster.init(
    {
      class: DataTypes.INTEGER,
      division: DataTypes.INTEGER,
      date: DataTypes.DATEONLY,
      holiday: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'holidarmaster',
      tableName: 'holidar_masters',
    }
  );

  return holidarmaster;
};
