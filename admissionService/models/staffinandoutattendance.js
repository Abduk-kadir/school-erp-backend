'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StaffInAndOutAttendance extends Model {
    static associate(models) {
      StaffInAndOutAttendance.belongsTo(models.StaffRegistration, {
        foreignKey: 'staff_id',
        targetKey: 'id',
        as: 'staff',
        constraints: false,
      });
    }
  }

  StaffInAndOutAttendance.init(
    {
      staff_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      attendance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      in_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      in_time_notification_flag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      out_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      out_time_notification_flag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      machine_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'StaffInAndOutAttendance',
      tableName: 'staff_in_and_out_attendances',
      indexes: [
        { fields: ['attendance_date'], name: 'idx_staff_in_out_attendance_date' },
        {
          fields: ['staff_id', 'attendance_date'],
          name: 'idx_staff_in_out_staff_id_date',
        },
      ],
    }
  );

  return StaffInAndOutAttendance;
};
