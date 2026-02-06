'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class institute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  institute.init({
    name: DataTypes.STRING,
    code: DataTypes.INTEGER,
    logo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'institute',
  });
  return institute;
};