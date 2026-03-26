'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PersonalInformation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      //this is for testing purspos we have to join with par_student_perosnl
      PersonalInformation.hasMany(models.FeeCollection, { foreignKey: 'reg_no', as: 'FeeCollection' });
      PersonalInformation.belongsTo(models.class_master, { foreignKey: 'class', targetKey: 'id', as: 'classInfo' });
      PersonalInformation.hasOne(models.form_status, {
        foreignKey: 'reg_no',
        sourceKey: 'reg_no',        // same FK as above 
        as: 'formStatus'
      });
      PersonalInformation.hasMany(models.student_subject, {
       foreignKey: 'student_reg_no',
  sourceKey: 'reg_no',
  as: 'studentSubjects'
      });
      PersonalInformation.hasMany(models.FeeRecordMonthly, {
        foreignKey: 'reg_no',
        sourceKey: 'reg_no',
        as: 'feeRecords'
      });
    }
  }
  PersonalInformation.init({
    first_name: DataTypes.STRING,
    reg_no: {
      type: DataTypes.BIGINT,
      unique: true
    },

    last_name: DataTypes.STRING,
    father_name: DataTypes.STRING,
    class: DataTypes.STRING,
    division: DataTypes.STRING,
    contact_number: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    dob: DataTypes.STRING,
    blood_group: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PersonalInformation',
  });
  return PersonalInformation;
};