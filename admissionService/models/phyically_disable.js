'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class phyically_disable extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  phyically_disable.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'phyically_disable',
  });
  return phyically_disable;
};