'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Bank extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Bank.hasMany(models.BankDetail, {
        foreignKey: 'bank_id',
        as: 'bankDetails',
        onDelete: 'CASCADE'
      });

      Bank.hasMany(models.FeeHead,{
        foreignKey: 'bank_id',
        as: 'feeDeads',
        onDelete: 'CASCADE'
      });
    }
  }
  Bank.init({
    bank_name: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Bank',
  });
  return Bank;
};