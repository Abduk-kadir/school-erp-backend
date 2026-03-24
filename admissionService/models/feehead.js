'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FeeHead extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     FeeHead.belongsTo(models.Bank, {
        foreignKey: 'bank_id',
        as: 'bank',
      });
    }
  }
  FeeHead.init({
    fee_head_name: DataTypes.STRING,
    bank_id: DataTypes.INTEGER,
    is_refundable: DataTypes.STRING,
    status: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'FeeHead',
  });
  return FeeHead;
};