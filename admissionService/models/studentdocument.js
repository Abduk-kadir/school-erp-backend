'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StudentDocument extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  StudentDocument.init({
    reg_number: DataTypes.INTEGER,
    document_id: DataTypes.INTEGER,
    file_path: DataTypes.STRING,
    original_filename: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'StudentDocument',
  });
  return StudentDocument;
};