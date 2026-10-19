'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class exam_configure extends Model {
    static associate(models) {
      exam_configure.belongsTo(models.exam_scheme, {
        foreignKey: 'exam_id',
        as: 'exam',
      });
      exam_configure.belongsTo(models.class_master, {
        foreignKey: 'class_id',
        as: 'classInfo',
      });
      exam_configure.belongsTo(models.term, {
        foreignKey: 'term_id',
        as: 'termInfo',
      });
      exam_configure.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
        as: 'subjectInfo',
      });
      exam_configure.belongsTo(models.grade_scale, {
        foreignKey: 'grade_scale_id',
        as: 'gradeScale',
      });
    }
  }

  exam_configure.init(
    {
      exam_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      class_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      term_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      grade_scale_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      is_separate_passing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_included_in_total: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      mark_or_grade: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      formative_total: DataTypes.INTEGER,
      formative_passing: DataTypes.INTEGER,
      formative_ratio: DataTypes.INTEGER,
      summative_total: DataTypes.INTEGER,
      summative_passing: DataTypes.INTEGER,
      summative_ratio: DataTypes.INTEGER,
      total_mark: DataTypes.INTEGER,
      total_passing: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'exam_configure',
      tableName: 'exam_configures',
    }
  );

  return exam_configure;
};
