'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StudentFeeGroupDetailPrice extends Model {
    static associate(models) {
      StudentFeeGroupDetailPrice.belongsTo(models.FeeGroupDetailPrice, {
        foreignKey: 'feegroupdetailpriceid',
        as: 'feeGroupDetailPrice'
      });
      StudentFeeGroupDetailPrice.belongsTo(models.FeeHead, {
        foreignKey: 'feeheadid',
        as: 'feeHead'
      });
      // Same reg_no column; include only one of these in a query at a time.
      StudentFeeGroupDetailPrice.belongsTo(models.PersonalInformation, {
        foreignKey: 'reg_no',
        targetKey: 'reg_no',
        as: 'personalInformation',
        constraints: false
      });
      StudentFeeGroupDetailPrice.belongsTo(models.par_student_personal_information, {
        foreignKey: 'reg_no',
        targetKey: 'reg_no',
        as: 'parStudentPersonalInformation',
        constraints: false
      });
    }
  }

  const d = () => DataTypes.DECIMAL(12, 2);

  StudentFeeGroupDetailPrice.init(
    {
      reg_no: DataTypes.BIGINT,
      feegroupdetailpriceid: DataTypes.INTEGER,
      feeheadid: DataTypes.INTEGER,
      jan_total: d(),
      jan_total_paid: d(),
      jan_total_due: d(),
      feb_total: d(),
      feb_total_paid: d(),
      feb_total_due: d(),
      mar_total: d(),
      mar_total_paid: d(),
      mar_total_due: d(),
      apr_total: d(),
      apr_total_paid: d(),
      apr_total_due: d(),
      may_total: d(),
      may_total_paid: d(),
      may_total_due: d(),
      jun_total: d(),
      jun_total_paid: d(),
      jun_total_due: d(),
      jul_total: d(),
      jul_total_paid: d(),
      jul_total_due: d(),
      aug_total: d(),
      aug_total_paid: d(),
      aug_total_due: d(),
      sep_total: d(),
      sep_total_paid: d(),
      sep_total_due: d(),
      oct_total: d(),
      oct_total_paid: d(),
      oct_total_due: d(),
      nov_total: d(),
      nov_total_paid: d(),
      nov_total_due: d(),
      dec_total: d(),
      dec_total_paid: d(),
      dec_total_due: d()
    },
    {
      sequelize,
      modelName: 'StudentFeeGroupDetailPrice',
      tableName: 'studentfeegroupdetailprices',
      indexes: [
        {
          unique: true,
          fields: ['reg_no', 'feegroupdetailpriceid'],
          name: 'studentfeegroupdetailprices_reg_feepricedetail_uidx'
        }
      ]
    }
  );
  return StudentFeeGroupDetailPrice;
};
