'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class exam_assessment extends Model {
    static associate(models) {
      exam_assessment.belongsTo(models.exam_scheme, {
        foreignKey: 'exam_scheme_id',
        as: 'scheme',
      });
      exam_assessment.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
        as: 'subjectInfo',
      });
      exam_assessment.belongsTo(models.component, {
        foreignKey: 'component_id',
        as: 'componentInfo',
      });
      exam_assessment.belongsTo(models.assessment_group, {
        foreignKey: 'group_id',
        as: 'groupInfo',
      });
      exam_assessment.hasMany(models.assessment_component, {
        foreignKey: 'exam_assessment_id',
        as: 'components',
      });
    }
  }

  exam_assessment.init(
    {
      exam_scheme_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      component_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      group_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      max_marks: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
      },
      ratio: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: true,
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      is_consider_inexam: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'exam_assessment',
      tableName: 'exam_assessments',
    }
  );

  return exam_assessment;
};
