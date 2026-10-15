'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class component extends Model {
    static associate(models) {
      component.hasMany(models.exam_assessment, {
        foreignKey: 'component_id',
        as: 'assessments',
      });
      component.hasMany(models.assessment_component, {
        foreignKey: 'component_id',
        as: 'assessmentComponents',
      });
    }
  }

  component.init(
    {
      component_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'component',
      tableName: 'components',
    }
  );

  return component;
};
