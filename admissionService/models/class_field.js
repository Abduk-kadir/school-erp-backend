'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class class_field extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      class_field.belongsTo(models.class_master, {
        foreignKey: 'class_id',
        as: 'class',
      });

      class_field.belongsTo(models.Field, {
        foreignKey: 'field_id',
        as: 'field',
      });

      class_field.belongsTo(models.Stage, {
        foreignKey: 'stage_id',
        as: 'stage',
      });
      
    }
  }
  class_field.init({
    class_id: DataTypes.INTEGER,
    field_id: DataTypes.INTEGER,
    stage_id:DataTypes.INTEGER,
    is_required: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'class_field',
  });
  return class_field;
};