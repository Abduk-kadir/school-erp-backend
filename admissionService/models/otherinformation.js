'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OtherInformation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       OtherInformation.belongsTo(models.PersonalInformation, {
        foreignKey: 'reg_no',
        as: 'PersonalInformation',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
    }
  }
  OtherInformation.init({
    reg_no: DataTypes.BIGINT,
    Hobies:DataTypes.STRING
  }, {
    sequelize,
    modelName: 'OtherInformation',
  });
  return OtherInformation;
};