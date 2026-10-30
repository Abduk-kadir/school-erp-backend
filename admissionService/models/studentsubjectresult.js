'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class student_subject_result extends Model {
    static associate(models) {
      student_subject_result.belongsTo(models.exam_scheme, {
        foreignKey: 'exam_scheme_id',
        as: 'scheme',
      });
      student_subject_result.belongsTo(models.par_student_personal_information, {
        foreignKey: 'student_id',
        as: 'student',
      });
      student_subject_result.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
        as: 'subjectInfo',
      });
      student_subject_result.belongsTo(models.exam_configure, {
        foreignKey: 'exam_configure_id',
        as: 'configure',
      });
    }
  }

  student_subject_result.init(
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
      exam_configure_id: DataTypes.INTEGER,
      formative_obtained: DataTypes.DECIMAL(7, 2),
      formative_max: DataTypes.DECIMAL(7, 2),
      formative_converted: DataTypes.DECIMAL(7, 2),
      formative_grade: DataTypes.STRING(10),
      formative_pass: DataTypes.BOOLEAN,
      summative_obtained: DataTypes.DECIMAL(7, 2),
      summative_max: DataTypes.DECIMAL(7, 2),
      summative_converted: DataTypes.DECIMAL(7, 2),
      summative_grade: DataTypes.STRING(10),
      summative_pass: DataTypes.BOOLEAN,
      total_obtained: DataTypes.DECIMAL(7, 2),
      total_max: DataTypes.DECIMAL(7, 2),
      total_grade: DataTypes.STRING(10),
      grade_point: DataTypes.DECIMAL(4, 2),
      is_pass: DataTypes.BOOLEAN,
      is_included_in_total: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_absent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'student_subject_result',
      tableName: 'student_subject_results',
    }
  );

  return student_subject_result;
};
