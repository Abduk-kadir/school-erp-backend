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
      StudentDocument.belongsTo(models.document_types,{
        foreignKey:'document_id',
        as:'documentType'
      })
    }
  }
  StudentDocument.init({
    reg_number: DataTypes.BIGINT,
    document_id: DataTypes.INTEGER,
    file_path: DataTypes.STRING,
    original_filename: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'StudentDocument',
  });
  return StudentDocument;
};