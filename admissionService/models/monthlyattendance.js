'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class monthlyattendance extends Model {
    static associate(models) {
      monthlyattendance.belongsTo(models.par_student_personal_information, {
        foreignKey: 'reg_no',
        targetKey: 'reg_no',
        as: 'student',
      });
    }
  }

  const dayFields = {};
  for (let day = 1; day <= 31; day++) {
    dayFields[String(day)] = DataTypes.STRING;
  }

  monthlyattendance.init(
    {
      reg_no: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      month_number: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ...dayFields,
      total_present: DataTypes.INTEGER,
      total_absent: DataTypes.INTEGER,
      total_workingdays: DataTypes.INTEGER,
      present_percent: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'monthlyattendance',
      tableName: 'monthlyattendances',
      indexes: [
        {
          unique: true,
          fields: ['reg_no', 'year', 'month_number'],
          name: 'uk_monthlyattendance_reg_no_year_month',
        },
      ],
    }
  );

  return monthlyattendance;
};
