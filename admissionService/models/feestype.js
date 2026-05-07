'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FeesType extends Model {
    static associate(models) {
      FeesType.hasMany(models.FeeGroupDetail, {
        foreignKey: 'fee_for',
        sourceKey: 'id',
        as: 'feeGroupDetails'
      });
    }
  }

  FeesType.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'FeesType'
    }
  );

  return FeesType;
};

