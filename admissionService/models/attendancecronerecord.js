'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class attendancecronerecord extends Model {
    static associate(models) {
      attendancecronerecord.belongsTo(models.batch, {
        foreignKey: 'batchid',
        as: 'batchInfo',
      });
      attendancecronerecord.belongsTo(models.class_master, {
        foreignKey: 'classid',
        as: 'classInfo',
      });
      attendancecronerecord.belongsTo(models.division_master, {
        foreignKey: 'divisionid',
        as: 'divisionInfo',
      });
    }
  }

  attendancecronerecord.init(
    {
      batchid: DataTypes.INTEGER,
      classid: DataTypes.INTEGER,
      divisionid: DataTypes.INTEGER,
      isrun: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'attendancecronerecord',
      tableName: 'attendance_cron_records',
    }
  );

  return attendancecronerecord;
};
