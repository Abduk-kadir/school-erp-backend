'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ElectiveBasket extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ElectiveBasket.belongsTo(models.class_master, {
        foreignKey: 'classId',
        as: 'class',
        onDelete: 'CASCADE',
      });
      ElectiveBasket.belongsTo(models.semester, {
        foreignKey: 'semester',
        as: 'semesterInfo',
      });
      ElectiveBasket.belongsTo(models.studenttype, {
        foreignKey: 'studenttype',
        as: 'studenttypeInfo',
      });
    }
  }
  ElectiveBasket.init({
    classId: DataTypes.INTEGER,
    semester: DataTypes.INTEGER,
    basketName: DataTypes.STRING,
    studenttype: DataTypes.INTEGER,
    minChoices: DataTypes.INTEGER,
    maxChoices: DataTypes.INTEGER,
    exactChoices: DataTypes.INTEGER,
    isMandatory: DataTypes.BOOLEAN,
    description: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'ElectiveBasket',
  });
  return ElectiveBasket;
};