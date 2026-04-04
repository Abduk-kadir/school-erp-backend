'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FeeGroupHead extends Model {
    static associate(models) {
      FeeGroupHead.belongsTo(models.FeeGroup, {
        foreignKey: 'groupid',
        as: 'feeGroup'
      });
      FeeGroupHead.belongsTo(models.FeeHead, {
        foreignKey: 'feeheadid',
        as: 'feeHead'
      });
    }
  }
  FeeGroupHead.init({
    groupid: DataTypes.INTEGER,
    feeheadid: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(12, 2)
  }, {
    sequelize,
    modelName: 'FeeGroupHead',
    tableName: 'feegroupheads'
  });
  return FeeGroupHead;
};
