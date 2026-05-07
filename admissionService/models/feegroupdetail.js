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
      FeeGroupDetail.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
        as: 'subject'
      });
      FeeGroupDetail.belongsTo(models.FeesType, {
        foreignKey: 'fee_for',
        targetKey: 'id',
        as: 'feeType'
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
    startmonth: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 12
      }
    },
    fee_for: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_elective: {
      type: DataTypes.STRING,
      allowNull: true
    },
    subject_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    isAdded_student: {
      type: DataTypes.STRING,
      allowNull: true
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
