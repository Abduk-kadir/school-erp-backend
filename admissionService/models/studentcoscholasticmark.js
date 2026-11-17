'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class student_co_scholastic_mark extends Model {
    static associate(models) {
      student_co_scholastic_mark.belongsTo(models.result_mark_entry_list, {
        foreignKey: 'result_mark_entry_list_id',
        as: 'entryList',
      });
      student_co_scholastic_mark.belongsTo(models.par_student_personal_information, {
        foreignKey: 'student_reg_no',
        targetKey: 'reg_no',
        as: 'student',
      });
    }
  }

  student_co_scholastic_mark.init(
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      result_mark_entry_list_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      student_reg_no: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      grade: DataTypes.STRING(10),
      status: {
        type: DataTypes.ENUM('present', 'absent', 'exempt'),
        allowNull: false,
        defaultValue: 'present',
      },
    },
    {
      sequelize,
      modelName: 'student_co_scholastic_mark',
      tableName: 'student_co_scholastic_marks',
    }
  );

  return student_co_scholastic_mark;
};
