'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class batch extends Model {
    static associate(models) {
      // define association here
    }
  }
  batch.init({
    batch_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'batch',
  });
  return batch;
};
