'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class admissionfeecollectiondetail extends Model {
    static associate(models) {
      admissionfeecollectiondetail.belongsTo(models.par_student_personal_information, {
        foreignKey: 'reg_no',
        targetKey: 'reg_no',
        as: 'student',
      });

      admissionfeecollectiondetail.belongsTo(models.admissionfeecollection, {
        foreignKey: 'fee_table_id',
        targetKey: 'id',
        as: 'feeCollectionInfo',
      });

      admissionfeecollectiondetail.belongsTo(models.FeeHead, {
        foreignKey: 'feeheadid',
        targetKey: 'id',
        as: 'feeHead',
      });
    }
  }

  admissionfeecollectiondetail.init(
    {
      reg_no: DataTypes.BIGINT,
      feeheadid: DataTypes.INTEGER,
      fee_table_id: DataTypes.INTEGER,
      date: DataTypes.DATE,
      jan_total: DataTypes.DECIMAL,
      jan_paid: DataTypes.DECIMAL,
      jan_total_paid: DataTypes.DECIMAL,
      jan_total_due: DataTypes.DECIMAL,
      feb_total: DataTypes.DECIMAL,
      feb_paid: DataTypes.DECIMAL,
      feb_total_paid: DataTypes.DECIMAL,
      feb_total_due: DataTypes.DECIMAL,
      mar_total: DataTypes.DECIMAL,
      mar_paid: DataTypes.DECIMAL,
      mar_total_paid: DataTypes.DECIMAL,
      mar_total_due: DataTypes.DECIMAL,
      apr_total: DataTypes.DECIMAL,
      apr_paid: DataTypes.DECIMAL,
      apr_total_paid: DataTypes.DECIMAL,
      apr_total_due: DataTypes.DECIMAL,
      may_total: DataTypes.DECIMAL,
      may_paid: DataTypes.DECIMAL,
      may_total_paid: DataTypes.DECIMAL,
      may_total_due: DataTypes.DECIMAL,
      jun_total: DataTypes.DECIMAL,
      jun_paid: DataTypes.DECIMAL,
      jun_total_paid: DataTypes.DECIMAL,
      jun_total_due: DataTypes.DECIMAL,
      jul_total: DataTypes.DECIMAL,
      jul_paid: DataTypes.DECIMAL,
      jul_total_paid: DataTypes.DECIMAL,
      jul_total_due: DataTypes.DECIMAL,
      aug_total: DataTypes.DECIMAL,
      aug_paid: DataTypes.DECIMAL,
      aug_total_paid: DataTypes.DECIMAL,
      aug_total_due: DataTypes.DECIMAL,
      sep_total: DataTypes.DECIMAL,
      sep_paid: DataTypes.DECIMAL,
      sep_total_paid: DataTypes.DECIMAL,
      sep_total_due: DataTypes.DECIMAL,
      oct_total: DataTypes.DECIMAL,
      oct_paid: DataTypes.DECIMAL,
      oct_total_paid: DataTypes.DECIMAL,
      oct_total_due: DataTypes.DECIMAL,
      nov_total: DataTypes.DECIMAL,
      nov_paid: DataTypes.DECIMAL,
      nov_total_paid: DataTypes.DECIMAL,
      nov_total_due: DataTypes.DECIMAL,
      dec_total: DataTypes.DECIMAL,
      dec_paid: DataTypes.DECIMAL,
      dec_total_paid: DataTypes.DECIMAL,
      dec_total_due: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: 'admissionfeecollectiondetail',
      indexes: [{ fields: ['fee_table_id'], name: 'admissionfeecollectiondetails_fee_table_id_idx' }],
    }
  );

  return admissionfeecollectiondetail;
};

