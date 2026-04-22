'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FineAssigned extends Model {
    static associate(models) {
      FineAssigned.belongsTo(models.class_master, {
        foreignKey: 'class_id',
        as: 'class',
      });
      FineAssigned.belongsTo(models.par_student_personal_information, {
        foreignKey: 'student_reg_no',
        targetKey: 'reg_no',
        as: 'student',
      });
    }
  }

  FineAssigned.init(
    {
      class_id: DataTypes.INTEGER,
      student_reg_no: DataTypes.BIGINT,
      fine_for_month: DataTypes.STRING,
      fine_amount: DataTypes.DECIMAL(12, 2),
      fine_pay_till_date: DataTypes.DATEONLY,
      remark: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'FineAssigned',
      tableName: 'fine_assigneds',
    }
  );

  return FineAssigned;
};
