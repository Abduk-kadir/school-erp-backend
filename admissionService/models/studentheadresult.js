'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class student_head_result extends Model {
    static associate(models) {
      student_head_result.belongsTo(models.exam_scheme, {
        foreignKey: 'exam_scheme_id',
        as: 'scheme',
      });
      student_head_result.belongsTo(models.par_student_personal_information, {
        foreignKey: 'student_id',
        as: 'student',
      });
      student_head_result.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
        as: 'subjectInfo',
      });
      student_head_result.belongsTo(models.exam_assessment, {
        foreignKey: 'exam_assessment_id',
        as: 'assessment',
      });
    }
  }

  student_head_result.init(
    {
      exam_scheme_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      exam_assessment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      obtained: DataTypes.DECIMAL(7, 2),
      max_marks: DataTypes.DECIMAL(7, 2),
      converted: DataTypes.DECIMAL(7, 2),
      grade: DataTypes.STRING(10),
      is_pass: DataTypes.BOOLEAN,
      is_absent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'student_head_result',
      tableName: 'student_head_results',
    }
  );

  return student_head_result;
};
