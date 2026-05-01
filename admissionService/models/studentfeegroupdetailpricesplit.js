'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StudentFeeGroupDetailpriceSplit extends Model {
    static associate(models) {
      StudentFeeGroupDetailpriceSplit.belongsTo(models.StudentFeeGroupDetailPrice, {
        foreignKey: 'student_installment_id',
        as: 'studentInstallment',
      });
    }
  }

  const d = () => DataTypes.DECIMAL(12, 2);

  StudentFeeGroupDetailpriceSplit.init(
    {
      student_installment_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      remark: DataTypes.TEXT,

      jan_total: d(),
      jan_split1: d(),
      jan_split2: d(),
      is_jan_pay: DataTypes.BOOLEAN,

      feb_total: d(),
      feb_split1: d(),
      feb_split2: d(),
      is_feb_pay: DataTypes.BOOLEAN,

      mar_total: d(),
      mar_split1: d(),
      mar_split2: d(),
      is_mar_pay: DataTypes.BOOLEAN,

      apr_total: d(),
      apr_split1: d(),
      apr_split2: d(),
      is_apr_pay: DataTypes.BOOLEAN,

      may_total: d(),
      may_split1: d(),
      may_split2: d(),
      is_may_pay: DataTypes.BOOLEAN,

      jun_total: d(),
      jun_split1: d(),
      jun_split2: d(),
      is_jun_pay: DataTypes.BOOLEAN,

      jul_total: d(),
      jul_split1: d(),
      jul_split2: d(),
      is_jul_pay: DataTypes.BOOLEAN,

      aug_total: d(),
      aug_split1: d(),
      aug_split2: d(),
      is_aug_pay: DataTypes.BOOLEAN,

      sep_total: d(),
      sep_split1: d(),
      sep_split2: d(),
      is_sep_pay: DataTypes.BOOLEAN,

      oct_total: d(),
      oct_split1: d(),
      oct_split2: d(),
      is_oct_pay: DataTypes.BOOLEAN,

      nov_total: d(),
      nov_split1: d(),
      nov_split2: d(),
      is_nov_pay: DataTypes.BOOLEAN,

      dec_total: d(),
      dec_split1: d(),
      dec_split2: d(),
      is_dec_pay: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'studentfeegroupDetailpriceSplit',
      tableName: 'studentfeegroupdetailpricesplits',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  return StudentFeeGroupDetailpriceSplit;
};
