'use strict';
const {
  Model
} = require('sequelize');

const SCHEDULE_TYPES = Object.freeze([
  'monthly',
  'quarterly',
  'half_yearly',
  'annually',
  'one_time'
]);

module.exports = (sequelize, DataTypes) => {
  class FeeGroupDetail extends Model {
    static associate(models) {
      FeeGroupDetail.belongsTo(models.FeeGroup, {
        foreignKey: 'feegroupid',
        as: 'feeGroup'
      });
      FeeGroupDetail.belongsTo(models.class_master, {
        foreignKey: 'classid',
        as: 'class'
      });
      FeeGroupDetail.hasMany(models.FeeGroupDetailPrice, {
        foreignKey: 'groupdetailid',
        as: 'feeGroupDetailPrices'
      });
    }
  }
  FeeGroupDetail.init({
    feegroupid: DataTypes.INTEGER,
    scheduletype: {
      type: DataTypes.ENUM(...SCHEDULE_TYPES),
      allowNull: false,
      defaultValue: 'monthly'
    },
    isbackwardclass: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    iselectivesubject: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    startmonth: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 12
      }
    },
    classid: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'FeeGroupDetail',
    tableName: 'feegroupdetails'
  });
  FeeGroupDetail.SCHEDULE_TYPES = SCHEDULE_TYPES;
  return FeeGroupDetail;
};
