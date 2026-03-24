'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class BankDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       BankDetail.belongsTo(models.Bank, {
        foreignKey: 'bank_id',
        as: 'bank',
      });
    }
  }
  BankDetail.init({
    bank_id: DataTypes.INTEGER,
    ifsc_code: DataTypes.STRING,
    account_number: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'BankDetail',
  });
  return BankDetail;
};