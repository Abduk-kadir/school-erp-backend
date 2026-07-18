'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class title extends Model {
    static associate(models) {
      title.hasMany(models.StaffRegistration, {
        foreignKey: 'title',
        as: 'staffMembers',
      });
    }
  }

  title.init(
    {
      title: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'title',
      tableName: 'titles',
    }
  );

  return title;
};
