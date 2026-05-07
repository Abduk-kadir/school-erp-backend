'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class transportfeecollection extends Model {
    static associate(models) {
      transportfeecollection.belongsTo(models.par_student_personal_information, {
        foreignKey: 'reg_no',
        targetKey: 'reg_no',
        as: 'student',
      });

      transportfeecollection.hasMany(models.transportfeecollectiondetail, {
        foreignKey: 'fee_table_id',
        as: 'transportFeeCollectionDetails',
      });

      transportfeecollection.hasMany(models.studentfine, {
        foreignKey: 'fee_table_id',
        as: 'studentFines',
      });
    }
  }

  transportfeecollection.init(
    {
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
      total_paid: DataTypes.INTEGER,
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
      split_response: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'transportfeecollection',
      indexes: [{ fields: ['reg_no'], name: 'transportfeecollections_reg_no_idx' }],
    }
  );

  return transportfeecollection;
};

