'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class staffFcmtoken extends Model {
    static associate(models) {
      staffFcmtoken.belongsTo(models.StaffRegistration, {
        foreignKey: 'staffid',
        as: 'staff',
      });
    }
  }

  staffFcmtoken.init(
    {
      staffid: DataTypes.INTEGER,
      token: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'staffFcmtoken',
      tableName: 'staff_fcmtokens',
      indexes: [
        { fields: ['staffid'], name: 'idx_staff_fcmtokens_staffid' },
      ],
    }
  );

  return staffFcmtoken;
};
