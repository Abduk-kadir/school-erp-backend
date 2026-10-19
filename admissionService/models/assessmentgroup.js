'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class assessment_group extends Model {
    static associate(models) {
      assessment_group.hasMany(models.exam_assessment, {
        foreignKey: 'group_id',
        as: 'assessments',
      });
    }
  }

  assessment_group.init(
    {
      group: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'assessment_group',
      tableName: 'assessment_groups',
    }
  );

  return assessment_group;
};
