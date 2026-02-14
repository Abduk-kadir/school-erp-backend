'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ParentParticular extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ParentParticular.belongsTo(models.PersonalInformation, {
        foreignKey: 'reg_no',
        as: 'PersonalInformation',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    }
  }
  ParentParticular.init({
    reg_no: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'ParentParticular',
  });
  return ParentParticular;
};