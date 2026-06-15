'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class eventmaster extends Model {
    static associate(models) {
      eventmaster.belongsTo(models.class_master, {
        foreignKey: 'class',
        as: 'classInfo',
      });
      eventmaster.belongsTo(models.division_master, {
        foreignKey: 'division',
        as: 'divisionInfo',
      });
    }
  }

  eventmaster.init(
    {
      class: DataTypes.INTEGER,
      division: DataTypes.INTEGER,
      date: DataTypes.DATEONLY,
      event: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'eventmaster',
      tableName: 'event_masters',
    }
  );

  return eventmaster;
};
