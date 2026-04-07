'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FeeGroupDetailPrice extends Model {
    static associate(models) {
      FeeGroupDetailPrice.belongsTo(models.FeeGroupDetail, {
        foreignKey: 'groupdetailid',
        as: 'feeGroupDetail'
      });
      FeeGroupDetailPrice.belongsTo(models.FeeHead, {
        foreignKey: 'feeheadid',
        as: 'feeHead'
      });
    }
  }
  FeeGroupDetailPrice.init({
    groupdetailid: DataTypes.INTEGER,
    feeheadid: DataTypes.INTEGER,
    jan_total: DataTypes.DECIMAL(12, 2),
    feb_total: DataTypes.DECIMAL(12, 2),
    mar_total: DataTypes.DECIMAL(12, 2),
    apr_total: DataTypes.DECIMAL(12, 2),
    may_total: DataTypes.DECIMAL(12, 2),
    jun_total: DataTypes.DECIMAL(12, 2),
    jul_total: DataTypes.DECIMAL(12, 2),
    aug_total: DataTypes.DECIMAL(12, 2),
    sep_total: DataTypes.DECIMAL(12, 2),
    oct_total: DataTypes.DECIMAL(12, 2),
    nov_total: DataTypes.DECIMAL(12, 2),
    dec_total: DataTypes.DECIMAL(12, 2)
  }, {
    sequelize,
    modelName: 'FeeGroupDetailPrice',
    tableName: 'feegroupdetailprices',
    indexes: [
      {
        unique: true,
        fields: ['groupdetailid', 'feeheadid'],
        name: 'feegroupdetailprices_groupdetail_feehead_uidx'
      }
    ]
  });
  return FeeGroupDetailPrice;
};
