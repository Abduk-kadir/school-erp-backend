'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class par_student_personal_information extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      par_student_personal_information.belongsTo(models.FeeGroup, {
        foreignKey: 'feegroupid',
        as: 'feeGroup'
      });
      par_student_personal_information.hasMany(models.FeeCollection, { foreignKey: 'reg_no', as: 'FeeCollection' });
    }
  }
  par_student_personal_information.init({
    reg_no: DataTypes.BIGINT,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    father_name: DataTypes.STRING,
    class: DataTypes.INTEGER,
    feegroupid: DataTypes.INTEGER,
    division: DataTypes.INTEGER,
    contact_number: DataTypes.STRING,
    password: DataTypes.STRING,
    dob: DataTypes.STRING,
    blood_groop: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'par_student_personal_information',
  });
  return par_student_personal_information;
};