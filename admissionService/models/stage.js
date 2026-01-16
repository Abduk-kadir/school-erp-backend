'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Stage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Stage.hasMany(models.Field, {
        foreignKey: 'stageId',
        as: 'fields',               // useful when you do stage.getFields()
        onDelete: 'CASCADE',        // when stage is deleted → delete its fields too
      });
    }
  }
  Stage.init({
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    order: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Stage',
  });
  return Stage;
};