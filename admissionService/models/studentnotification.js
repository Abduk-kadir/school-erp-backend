'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class studentnotification extends Model {
    static associate(models) {
      studentnotification.belongsTo(models.batch, {
        foreignKey: 'batch',
        as: 'batchInfo',
      });
      studentnotification.belongsTo(models.class_master, {
        foreignKey: 'class',
        as: 'classInfo',
      });
      studentnotification.belongsTo(models.division_master, {
        foreignKey: 'division',
        as: 'divisionInfo',
      });
      studentnotification.belongsTo(models.StaffRegistration, {
        foreignKey: 'staffid',
        as: 'staffInfo',
      });
    }
  }

  studentnotification.init(
    {
      class: DataTypes.INTEGER,
      batch: DataTypes.INTEGER,
      division: DataTypes.INTEGER,
      staffid: DataTypes.INTEGER,
      
      message: DataTypes.STRING,
      document_url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'studentnotification',
      tableName: 'student_notifications',
    }
  );

  return studentnotification;
};
