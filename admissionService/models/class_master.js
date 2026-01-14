'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class class_master extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  class_master.init({
    class_name: DataTypes.STRING,
    class_code: DataTypes.STRING,
    fall_in_category: DataTypes.STRING,
    status: DataTypes.BOOLEAN,
    admission_form_fee: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'class_master',
  });
  return class_master;
};