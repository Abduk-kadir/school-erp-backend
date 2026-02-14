'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EducationDetail extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      EducationDetail.belongsTo(models.PersonalInformation, {
        foreignKey: 'reg_no',
        as: 'PersonalInformation',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      })
      
    }
  }
  EducationDetail.init({
    reg_no: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'EducationDetail',
  });
  return EducationDetail;
};