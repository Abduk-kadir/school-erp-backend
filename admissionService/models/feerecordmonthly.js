'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FeeRecordMonthly extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FeeRecordMonthly.belongsTo(models.PersonalInformation, {
        foreignKey: 'reg_no',
        targetKey: 'reg_no',
        as: 'student'
      });
      FeeRecordMonthly.belongsTo(models.FeeCollection, {
        foreignKey: 'fee_table_id',
        targetKey: 'id',
        as: 'feeCollectionInfo'
      });

      FeeRecordMonthly.belongsTo(models.FeeHead, {
        foreignKey: 'feeheadid',
        targetKey: 'id',
        as: 'feeHead'
      });
    }
  }
  FeeRecordMonthly.init({
    reg_no: DataTypes.BIGINT,
    feeheadid: DataTypes.INTEGER,
    fee_table_id: DataTypes.INTEGER,
    date: DataTypes.DATE,
    jan_total: DataTypes.DECIMAL,
    jan_paid: DataTypes.DECIMAL,
    jan_due: DataTypes.DECIMAL,
    feb_total: DataTypes.DECIMAL,
    feb_paid: DataTypes.DECIMAL,
    feb_due: DataTypes.DECIMAL,
    mar_total: DataTypes.DECIMAL,
    mar_paid: DataTypes.DECIMAL,
    mar_due: DataTypes.DECIMAL,
    apr_total: DataTypes.DECIMAL,
    apr_paid: DataTypes.DECIMAL,
    apr_due: DataTypes.DECIMAL,
    may_total: DataTypes.DECIMAL,
    may_paid: DataTypes.DECIMAL,
    may_due: DataTypes.DECIMAL,
    jun_total: DataTypes.DECIMAL,
    jun_paid: DataTypes.DECIMAL,
    jun_due: DataTypes.DECIMAL,
    jul_total: DataTypes.DECIMAL,
    jul_paid: DataTypes.DECIMAL,
    jul_due: DataTypes.DECIMAL,
    aug_total: DataTypes.DECIMAL,
    aug_paid: DataTypes.DECIMAL,
    aug_due: DataTypes.DECIMAL,
    sep_total: DataTypes.DECIMAL,
    sep_paid: DataTypes.DECIMAL,
    sep_due: DataTypes.DECIMAL,
    oct_total: DataTypes.DECIMAL,
    oct_paid: DataTypes.DECIMAL,
    oct_due: DataTypes.DECIMAL,
    nov_total: DataTypes.DECIMAL,
    nov_paid: DataTypes.DECIMAL,
    nov_due: DataTypes.DECIMAL,
    dec_total: DataTypes.DECIMAL,
    dec_paid: DataTypes.DECIMAL,
    dec_due: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'FeeRecordMonthly',
    indexes: [
     
      { fields: ['fee_table_id'], name: 'feerecordmonthlies_fee_table_id_idx' }
    ]
  });
  return FeeRecordMonthly;
};