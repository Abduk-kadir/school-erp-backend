'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class exam_scheme extends Model {
    static associate(models) {
      exam_scheme.belongsTo(models.exam_name, {
        foreignKey: 'exam_name_id',
        as: 'examNameInfo',
      });
      exam_scheme.belongsTo(models.class_master, {
        foreignKey: 'class_id',
        as: 'classInfo',
      });
      exam_scheme.belongsTo(models.term, {
        foreignKey: 'term_id',
        as: 'termInfo',
      });
      exam_scheme.belongsTo(models.Program, {
        foreignKey: 'program_id',
        as: 'programInfo',
      });
      exam_scheme.belongsTo(models.semester, {
        foreignKey: 'semester_id',
        as: 'semesterInfo',
      });
      exam_scheme.hasMany(models.exam_assessment, {
        foreignKey: 'exam_scheme_id',
        as: 'assessments',
      });
    }
  }

  exam_scheme.init(
    {
      exam_name_id: {
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
      program_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      semester_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'exam_scheme',
      tableName: 'exam_schemes',
    }
  );

  return exam_scheme;
};
