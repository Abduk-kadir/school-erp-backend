'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class errorlogs extends Model {}

  errorlogs.init(
    {
      message: DataTypes.TEXT,
      stack: DataTypes.TEXT,
      url: DataTypes.STRING(255),
      method: DataTypes.STRING(10),
      body: DataTypes.TEXT,
      status_code: DataTypes.INTEGER,
      type: DataTypes.STRING(50),
    },
    {
      sequelize,
      modelName: 'errorlogs',
      tableName: 'error_logs',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false,
    }
  );

  return errorlogs;
};
