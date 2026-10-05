'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class monthlyattendancelastindex extends Model {
    static associate() {}
  }

  monthlyattendancelastindex.init(
    {
      lastreadvalue: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'monthlyattendancelastindex',
      tableName: 'monthlyattendancelastindexes',
      timestamps: false,
    }
  );

  return monthlyattendancelastindex;
};
