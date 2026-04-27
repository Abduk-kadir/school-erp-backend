'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class studentfine extends Model {
    static associate(models) {
      studentfine.belongsTo(models.class_master, {
        foreignKey: 'class',
        as: 'classInfo',
      });
      studentfine.belongsTo(models.par_student_personal_information, {
        foreignKey: 'reg_no',
        targetKey: 'reg_no',
        as: 'student',
      });
      studentfine.belongsTo(models.FeeCollection, {
        foreignKey: 'fee_table_id',
        targetKey: 'id',
        as: 'feeCollection',
      });
    }
  }

  studentfine.init(
    {
      reg_no: DataTypes.BIGINT,
      class: DataTypes.INTEGER,
      actualfineamount: DataTypes.DECIMAL(12, 2),
      assignedfineamount: DataTypes.DECIMAL(12, 2),
      paidfineamount: DataTypes.DECIMAL(12, 2),
      date: DataTypes.DATEONLY,
      reciept_no: DataTypes.STRING,
      month: DataTypes.STRING,
      fee_table_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'studentfine',
      tableName: 'student_fines',
    }
  );

  return studentfine;
};
