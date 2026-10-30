'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class student_exam_result extends Model {
    static associate(models) {
      student_exam_result.belongsTo(models.exam_scheme, {
        foreignKey: 'exam_scheme_id',
        as: 'scheme',
      });
      student_exam_result.belongsTo(models.par_student_personal_information, {
        foreignKey: 'student_id',
        as: 'student',
      });
      student_exam_result.belongsTo(models.class_master, {
        foreignKey: 'class_id',
        as: 'classInfo',
      });
      student_exam_result.belongsTo(models.division_master, {
        foreignKey: 'division_id',
        as: 'divisionInfo',
      });
    }
  }

  student_exam_result.init(
    {
      exam_scheme_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      student_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      class_id: DataTypes.INTEGER,
      division_id: DataTypes.INTEGER,
      grand_total: DataTypes.DECIMAL(8, 2),
      grand_max: DataTypes.DECIMAL(8, 2),
      percentage: DataTypes.DECIMAL(5, 2),
      overall_grade: DataTypes.STRING(10),
      result_status: {
        type: DataTypes.ENUM('pass', 'fail', 'incomplete'),
        allowNull: false,
        defaultValue: 'incomplete',
      },
      class_rank: DataTypes.INTEGER,
      processed_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'student_exam_result',
      tableName: 'student_exam_results',
    }
  );

  return student_exam_result;
};
