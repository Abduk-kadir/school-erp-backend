'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class InOutAttendance extends Model {
    static associate(models) {
      InOutAttendance.belongsTo(models.par_student_personal_information, {
        foreignKey: 'reg_no',
        targetKey: 'reg_no',
        as: 'student',
      });
    }
  }

  InOutAttendance.init(
    {
      reg_no: {
        type: DataTypes.BIGINT,
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
      machine_id:{
        type:DataTypes.STRING,
        allowNull:true,
      }
    },
    {
      sequelize,
      modelName: 'InOutAttendance',
      tableName: 'in_out_attendances',
      indexes: [
        { fields: ['attendance_date'], name: 'idx_in_out_attendance_date' },
        {
          fields: ['reg_no', 'attendance_date'],
          name: 'idx_in_out_reg_no_date',
        },
      ],
    }
  );

  return InOutAttendance;
};
