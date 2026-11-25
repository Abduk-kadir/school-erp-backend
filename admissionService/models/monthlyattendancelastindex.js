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
      lastcronrecordid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        defaultValue: 0,
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
