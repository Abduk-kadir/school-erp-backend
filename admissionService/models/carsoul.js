'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class carsoul extends Model {
    static associate(models) {
      // no associations
    }
  }

  carsoul.init(
    {
      image_url: DataTypes.STRING,
      title: DataTypes.STRING,
      heading: DataTypes.STRING,
      subheading: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'carsoul',
      tableName: 'carsouls',
    }
  );

  return carsoul;
};
