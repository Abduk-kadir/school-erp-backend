'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class student_declaration extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       student_declaration.belongsTo(models.Declaration, {
        foreignKey: 'declaration_id',
        as: 'declaration',
      });
      // define association here
    }
  }
  student_declaration.init({
    reg_no: DataTypes.INTEGER,
    declaration_id: DataTypes.INTEGER,
    accepted: DataTypes.BOOLEAN,
    date: DataTypes.DATE,
    location: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'student_declaration',
  });
  return student_declaration;
};