'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class exam_name extends Model {
    static associate(models) {
      exam_name.hasMany(models.exam_scheme, {
        foreignKey: 'exam_name_id',
        as: 'examSchemes',
      });
    }
  }

  exam_name.init(
    {
      exam_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'exam_name',
      tableName: 'exam_names',
    }
  );

  return exam_name;
};
