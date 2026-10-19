'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class grade_scale extends Model {
    static associate(models) {
      grade_scale.hasMany(models.grade_scale_range, {
        foreignKey: 'grade_scale_id',
        as: 'ranges',
      });
      grade_scale.hasMany(models.exam_configure, {
        foreignKey: 'grade_scale_id',
        as: 'examConfigures',
      });
    }
  }

  grade_scale.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM('marks', 'descriptor'),
        allowNull: false,
        defaultValue: 'marks',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'grade_scale',
      tableName: 'grade_scales',
    }
  );

  return grade_scale;
};
