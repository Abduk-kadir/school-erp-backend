'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class othercrousal extends Model {
    static associate(models) {
      // no associations
    }
  }

  othercrousal.init(
    {
      image_url: DataTypes.STRING,
      title: DataTypes.STRING,
      heading: DataTypes.STRING,
      subheading: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'othercrousal',
      tableName: 'othercrousals',
    }
  );

  return othercrousal;
};
