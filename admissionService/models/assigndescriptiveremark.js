'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class assign_descriptive_remark extends Model {
    static associate(models) {
      assign_descriptive_remark.belongsTo(models.exam_scheme, {
        foreignKey: 'exam_scheme_id',
        as: 'scheme',
      });
      assign_descriptive_remark.belongsTo(models.descriptive_remark, {
        foreignKey: 'remark_id',
        as: 'remarkInfo',
      });
      assign_descriptive_remark.belongsTo(models.par_student_personal_information, {
        foreignKey: 'reg_no',
        targetKey: 'reg_no',
        as: 'student',
      });
    }
  }

  assign_descriptive_remark.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      exam_scheme_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      reg_no: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      remark_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'assign_descriptive_remark',
      tableName: 'assign_descriptive_remarks',
    }
  );

  return assign_descriptive_remark;
};
