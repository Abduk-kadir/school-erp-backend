'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class grade_scale_range extends Model {
    static associate(models) {
      grade_scale_range.belongsTo(models.grade_scale, {
        foreignKey: 'grade_scale_id',
        as: 'gradeScale',
      });
    }
  }

  grade_scale_range.init(
    {
      grade_scale_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      grade: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      description: DataTypes.STRING(100),
      min_percent: DataTypes.DECIMAL(5, 2),
      max_percent: DataTypes.DECIMAL(5, 2),
      grade_point: DataTypes.DECIMAL(4, 2),
      is_fail: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      sequence: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'grade_scale_range',
      tableName: 'grade_scale_ranges',
    }
  );

  return grade_scale_range;
};
