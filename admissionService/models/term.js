'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class term extends Model {
    static associate(models) {
      term.hasMany(models.exam_scheme, {
        foreignKey: 'term_id',
        as: 'examSchemes',
      });
    }
  }

  term.init(
    {
      term_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'term',
      tableName: 'terms',
    }
  );

  return term;
};
