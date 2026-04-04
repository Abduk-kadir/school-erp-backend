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
    jantotal: DataTypes.DECIMAL(12, 2),
    febtotal: DataTypes.DECIMAL(12, 2),
    marchtotal: DataTypes.DECIMAL(12, 2),
    apriltotal: DataTypes.DECIMAL(12, 2),
    maytotal: DataTypes.DECIMAL(12, 2),
    juntotal: DataTypes.DECIMAL(12, 2),
    jultotal: DataTypes.DECIMAL(12, 2),
    augtotal: DataTypes.DECIMAL(12, 2),
    septotal: DataTypes.DECIMAL(12, 2),
    octtotal: DataTypes.DECIMAL(12, 2),
    novtotal: DataTypes.DECIMAL(12, 2),
    dectotal: DataTypes.DECIMAL(12, 2)
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
