'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class assessment_component extends Model {
    static associate(models) {
      assessment_component.belongsTo(models.exam_assessment, {
        foreignKey: 'exam_assessment_id',
        as: 'assessment',
      });
      assessment_component.belongsTo(models.component, {
        foreignKey: 'component_id',
        as: 'componentInfo',
      });
    }
  }

  assessment_component.init(
    {
      exam_assessment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      modelName: 'assessment_component',
      tableName: 'assessment_components',
    }
  );

  return assessment_component;
};
