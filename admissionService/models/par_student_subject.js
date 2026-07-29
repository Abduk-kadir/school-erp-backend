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
      par_student_subject.belongsTo(models.par_student_personal_information, {
        foreignKey: 'student_reg_no',
        as: 'student',
      });
      par_student_subject.belongsTo(models.class_master, {
        foreignKey: 'class_id',
        as: 'class',
      });
      par_student_subject.belongsTo(models.Program, {
        foreignKey: 'program_id',
        as: 'program',
      });
      par_student_subject.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
        as: 'subject',
      });
      par_student_subject.belongsTo(models.ElectiveBasket, {
        foreignKey: 'elective_bbasket_id',
        as: 'electiveBasket',
      });
      par_student_subject.belongsTo(models.semester, {
        foreignKey: 'semester',
        as: 'semesterInfo',
      });
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