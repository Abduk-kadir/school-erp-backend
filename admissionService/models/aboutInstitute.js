'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class aboutInstitute extends Model {
    static associate(models) {
      aboutInstitute.hasMany(models.aboutinstituteimage, {
        foreignKey: 'aboutinstId',
        as: 'images',
      });
    }
  }

  aboutInstitute.init(
    {
      text: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: 'aboutInstitute',
      tableName: 'about_institutes',
    }
  );

  return aboutInstitute;
};
