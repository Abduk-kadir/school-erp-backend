'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class par_student_document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  par_student_document.init({
    reg_no: DataTypes.BIGINT,
    doucment_id: DataTypes.INTEGER,
    file_path: DataTypes.STRING,
    original_filename: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'par_student_document',
  });
  return par_student_document;
};