'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class student_mark extends Model {
    static associate(models) {
      student_mark.belongsTo(models.result_mark_entry_list, {
        foreignKey: 'result_mark_entry_list_id',
        as: 'entryList',
      });
      student_mark.belongsTo(models.exam_assessment, {
        foreignKey: 'exam_assessment_id',
        as: 'assessment',
      });
      student_mark.belongsTo(models.assessment_component, {
        foreignKey: 'assessment_component_id',
        as: 'assessmentComponent',
      });
      student_mark.belongsTo(models.par_student_personal_information, {
        foreignKey: 'student_id',
        as: 'student',
      });
    }
  }

  student_mark.init(
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
      exam_assessment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      assessment_component_id: DataTypes.INTEGER,
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      marks: DataTypes.DECIMAL(6, 2),
      grade: DataTypes.STRING(10),
      status: {
        type: DataTypes.ENUM('present', 'absent', 'exempt'),
        allowNull: false,
        defaultValue: 'present',
      },
      
    },
    {
      sequelize,
      modelName: 'student_mark',
      tableName: 'student_marks',
    }
  );

  return student_mark;
};
