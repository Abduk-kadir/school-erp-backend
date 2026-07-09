'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class timetable extends Model {
    static associate(models) {
      timetable.belongsTo(models.batch, {
        foreignKey: 'batch',
        as: 'batchInfo',
      });
      timetable.belongsTo(models.class_master, {
        foreignKey: 'class',
        as: 'classInfo',
      });
      timetable.belongsTo(models.division_master, {
        foreignKey: 'division',
        as: 'divisionInfo',
      });
      timetable.belongsTo(models.StaffRegistration, {
        foreignKey: 'staffid',
        as: 'staffInfo',
      });
    }
  }

  timetable.init(
    {
      batch: DataTypes.INTEGER,
      class: DataTypes.INTEGER,
      division: DataTypes.INTEGER,
      staffid: DataTypes.INTEGER,
      valid_from: DataTypes.DATEONLY,
      timetable_url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'timetable',
      tableName: 'timetables',
    }
  );

  return timetable;
};
