'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AttendanceLecturewise extends Model {
    static associate(models) {
      AttendanceLecturewise.belongsTo(models.par_student_personal_information, {
        foreignKey: 'reg_no',
        targetKey: 'reg_no',
        as: 'student',
      });

      AttendanceLecturewise.belongsTo(models.Subject, {
        foreignKey: 'subjectid',
        as: 'subject',
      });

      AttendanceLecturewise.belongsTo(models.StaffRegistration, {
        foreignKey: 'staffid',
        as: 'staff',
      });
    }
  }

  AttendanceLecturewise.init(
    {
      reg_no: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      attendance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      subjectid: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      attendance: {
        type: DataTypes.TINYINT,
        allowNull: false,
        defaultValue: 0,
        comment: '0=absent, 1=present',
      },
      staffid: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'AttendanceLecturewise',
      tableName: 'attendance_lecturewises',
      indexes: [
        { fields: ['attendance_date'], name: 'idx_lec_attendance_date' },
        { fields: ['reg_no', 'attendance'], name: 'idx_lec_reg_no_attendance' },
      ],
    }
  );

  return AttendanceLecturewise;
};
