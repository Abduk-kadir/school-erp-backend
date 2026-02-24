'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class par_student_subject extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  par_student_subject.init({
    student_reg_no: DataTypes.BIGINT,
    class_id: DataTypes.INTEGER,
    program_id: DataTypes.INTEGER,
    semester: DataTypes.INTEGER,
    subject_id: DataTypes.INTEGER,
    elective_bbasket_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'par_student_subject',
  });
  return par_student_subject;
};