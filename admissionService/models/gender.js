'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class gender extends Model {
    static associate(models) {
      // associations here if needed later
    }
  }

  gender.init(
    {
      gender_name: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'gender',
      tableName: 'genders',
    }
  );

  return gender;
};
