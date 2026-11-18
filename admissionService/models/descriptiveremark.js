'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class descriptive_remark extends Model {
    static associate(models) {
      descriptive_remark.hasMany(models.assign_descriptive_remark, {
        foreignKey: 'remark_id',
        as: 'assignments',
      });
    }
  }

  descriptive_remark.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      remark: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'descriptive_remark',
      tableName: 'descriptive_remarks',
    }
  );

  return descriptive_remark;
};
