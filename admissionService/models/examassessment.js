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
        allowNull: false,
      },
      max_marks: {
        type: DataTypes.DECIMAL(6, 2),
        allowNull: false,
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
