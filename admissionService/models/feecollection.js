'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FeeCollection extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      FeeCollection.belongsTo(models.PersonalInformation, { foreignKey: 'reg_no', targetKey: 'reg_no', as: 'PeronalInformation' });
      FeeCollection.belongsTo(models.par_student_personal_information, { foreignKey: 'reg_no' });

      FeeCollection.hasMany(models.FeeRecordMonthly, {
        foreignKey: 'fee_table_id',
        as: 'feecollectionrecords'
      });

      FeeCollection.hasMany(models.studentfine, {
        foreignKey: 'fee_table_id',
        as: 'studentFines',
      });
    }
  }
  FeeCollection.init({
    reg_no: DataTypes.BIGINT,
    client_txt_id: DataTypes.STRING,
    reciept_no: DataTypes.STRING,
    transaction_no: DataTypes.STRING,
    failure_message: DataTypes.STRING,
    card_name: DataTypes.STRING,
    payment_mode: DataTypes.STRING,
    added_by: DataTypes.STRING,
    role_id: DataTypes.INTEGER,
    fine: DataTypes.STRING,
    consession: DataTypes.BOOLEAN,
    consessionamount: DataTypes.DECIMAL(12, 2),
    discount_type_id: DataTypes.INTEGER,
    total: DataTypes.INTEGER,
    total_paid:DataTypes.INTEGER,
    payment: DataTypes.INTEGER,
    balance: DataTypes.INTEGER,
    remark: DataTypes.STRING,
    payment_type: DataTypes.STRING,
    dd_number: DataTypes.STRING,
    dd_date: DataTypes.DATE,
    check_no: DataTypes.STRING,
    ref_no: DataTypes.STRING,
    check_date: DataTypes.DATE,
    check_name: DataTypes.STRING,
    bank_id: DataTypes.INTEGER,
    start_month: DataTypes.INTEGER,
    paid_and_unpai_month: DataTypes.STRING,
    extra_fee: DataTypes.INTEGER,
    date: DataTypes.DATE,
    split_flag: DataTypes.INTEGER,
    raw_data: DataTypes.STRING,
    installment: DataTypes.INTEGER,
    split_response: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'FeeCollection',
    indexes: [
      { fields: ['reg_no'], name: 'feecollections_reg_no_idx' }
    ]
  });
  return FeeCollection;
};