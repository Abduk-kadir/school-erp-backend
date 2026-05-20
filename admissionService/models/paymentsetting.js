'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PaymentSetting extends Model {
    static associate(models) {
      PaymentSetting.belongsTo(models.class_master, {
        foreignKey: 'classid',
        as: 'class'
      });
      PaymentSetting.belongsTo(models.FeesType, {
        foreignKey: 'feetype',
        targetKey: 'id',
        as: 'feeType'
      });
    }
  }

  PaymentSetting.init(
    {
      paymentGateway: {
        type: DataTypes.STRING,
        allowNull: true
      },
      classid: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      merchantId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      key: {
        type: DataTypes.STRING,
        allowNull: true
      },
      accessCode: {
        type: DataTypes.STRING,
        allowNull: true
      },
      feetype: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      isSplit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: 'PaymentSetting',
      tableName: 'PaymentSettings'
    }
  );

  return PaymentSetting;
};
