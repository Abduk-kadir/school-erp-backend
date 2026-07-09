'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class diary extends Model {
    static associate(models) {
      diary.belongsTo(models.batch, {
        foreignKey: 'batch',
        as: 'batchInfo',
      });
      diary.belongsTo(models.class_master, {
        foreignKey: 'class',
        as: 'classInfo',
      });
      diary.belongsTo(models.division_master, {
        foreignKey: 'division',
        as: 'divisionInfo',
      });
      diary.belongsTo(models.Subject, {
        foreignKey: 'subject',
        as: 'subjectInfo',
      });
      diary.belongsTo(models.StaffRegistration, {
        foreignKey: 'staffid',
        as: 'staffInfo',
      });
    }
  }

  diary.init(
    {
      class: DataTypes.INTEGER,
      batch: DataTypes.INTEGER,
      division: DataTypes.INTEGER,
      subject: DataTypes.INTEGER,
      staffid: DataTypes.INTEGER,
      message: DataTypes.STRING,
      diary_url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'diary',
      tableName: 'diaries',
    }
  );

  return diary;
};
