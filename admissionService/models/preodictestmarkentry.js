'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class preodictestmarkentry extends Model {
    static associate(models) {
      preodictestmarkentry.belongsTo(models.preodictest, {
        foreignKey: 'preodictest_id',
        as: 'preodictestInfo',
      });
      preodictestmarkentry.belongsTo(models.par_student_personal_information, {
        foreignKey: 'reg_no',
        targetKey: 'reg_no',
        as: 'student',
      });
    }
  }

  preodictestmarkentry.init(
    {
      preodictest_id: DataTypes.INTEGER,
      reg_no: DataTypes.BIGINT,
      mark_obtained: DataTypes.INTEGER,
      date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'preodictestmarkentry',
      tableName: 'preodictestmarkentries',
      indexes: [
        {
          unique: true,
          fields: ['preodictest_id', 'reg_no'],
          name: 'uk_preodictestmarkentry_test_reg_no',
        },
      ],
    }
  );

  return preodictestmarkentry;
};
