'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class aboutinstituteimage extends Model {
    static associate(models) {
      aboutinstituteimage.belongsTo(models.aboutInstitute, {
        foreignKey: 'aboutinstId',
        as: 'aboutInstitute',
      });
    }
  }

  aboutinstituteimage.init(
    {
      aboutinstId: DataTypes.INTEGER,
      image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'aboutinstituteimage',
      tableName: 'about_institute_images',
    }
  );

  return aboutinstituteimage;
};
