'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class batchmaster extends Model {
    static associate(models) {
      batchmaster.belongsTo(models.batch, {
        foreignKey: 'batchid',
        as: 'batchInfo',
      });
      batchmaster.belongsTo(models.class_master, {
        foreignKey: 'classid',
        as: 'classInfo',
      });
      batchmaster.belongsTo(models.division_master, {
        foreignKey: 'divisionid',
        as: 'divisionInfo',
      });
    }
  }

  batchmaster.init(
    {
      batchid: DataTypes.INTEGER,
      classid: DataTypes.INTEGER,
      divisionid: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'batchmaster',
      tableName: 'batch_masters',
    }
  );

  return batchmaster;
};

