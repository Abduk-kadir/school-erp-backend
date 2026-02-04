'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Declaration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Declaration.belongsTo(models.class_master, {
        foreignKey: 'class_id',
        as: 'class',
        onDelete: 'CASCADE',
      });
    }
  }
  Declaration.init({
    class_id: DataTypes.INTEGER,
    content: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Declaration',
  });
  return Declaration;
};