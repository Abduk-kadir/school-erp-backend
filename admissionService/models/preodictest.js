'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class preodictest extends Model {
    static associate(models) {
      preodictest.belongsTo(models.class_master, {
        foreignKey: 'class',
        as: 'classInfo',
      });
      preodictest.belongsTo(models.division_master, {
        foreignKey: 'division',
        as: 'divisionInfo',
      });
      preodictest.belongsTo(models.Subject, {
        foreignKey: 'subject',
        as: 'subjectInfo',
      });
      preodictest.belongsTo(models.StaffRegistration, {
        foreignKey: 'staffid',
        as: 'staffInfo',
      });
    }
  }

  preodictest.init(
    {
      exam_name: DataTypes.STRING,
      class: DataTypes.INTEGER,
      division: DataTypes.INTEGER,
      subject: DataTypes.INTEGER,
      staffid: DataTypes.INTEGER,
      date: DataTypes.DATEONLY,
      total_marks: DataTypes.INTEGER,
      topics: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'preodictest',
      tableName: 'preodictests',
    }
  );

  return preodictest;
};
