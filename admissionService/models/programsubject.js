'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProgramSubject extends Model {
   
    static associate(models) {
      ProgramSubject.belongsTo(models.class_master, {
        foreignKey: 'classId',
        as: 'class',
       
      });
      ProgramSubject.belongsTo(models.Program, {
        foreignKey: 'programId',
        as: 'program',
        allowNull: true,      // important: programId can be NULL
        
      });
       ProgramSubject.belongsTo(models.Subject, {
        foreignKey: 'subjectId',
        as: 'subject',
        allowNull: true,      // important: programId can be NULL
        
      });
     
    }
  }
  ProgramSubject.init({
    classId: DataTypes.INTEGER,
    programId: DataTypes.INTEGER,
    subjectId: DataTypes.INTEGER,
    semester: DataTypes.INTEGER,
    isCompulsory: DataTypes.BOOLEAN,
    basketId: DataTypes.INTEGER,
    sequence: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ProgramSubject',
  });
  return ProgramSubject;
};