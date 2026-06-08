'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class studentFcmtoken extends Model {
    static associate(models) {
      studentFcmtoken.belongsTo(models.par_student_personal_information, {
        foreignKey: 'studentid',
        as: 'student',
      });
    }
  }

  studentFcmtoken.init(
    {
      studentid: DataTypes.INTEGER,
      token: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'studentFcmtoken',
      tableName: 'student_fcmtokens',
      indexes: [
        { fields: ['studentid'], name: 'idx_student_fcmtokens_studentid' },
      ],
    }
  );

  return studentFcmtoken;
};
