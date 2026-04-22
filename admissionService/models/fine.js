'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Fine extends Model {
    static associate(models) {
      Fine.belongsTo(models.class_master, {
        foreignKey: 'class_id',
        as: 'class',
      });
    }
  }

  Fine.init(
    {
      class_id: DataTypes.INTEGER,
      fine_for_month: DataTypes.STRING,
      fine_type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'onetime'),
      fine_start_date: DataTypes.DATEONLY,
      fine_amount: DataTypes.DECIMAL(12, 2),
    },
    {
      sequelize,
      modelName: 'Fine',
      tableName: 'Fines',
    }
  );

  return Fine;
};
