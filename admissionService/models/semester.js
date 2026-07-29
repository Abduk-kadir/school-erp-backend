'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class semester extends Model {
    static associate(models) {
      semester.hasMany(models.ProgramSubject, {
        foreignKey: 'semester',
        as: 'programSubjects',
      });
      semester.hasMany(models.student_subject, {
        foreignKey: 'semester',
        as: 'studentSubjects',
      });
      semester.hasMany(models.par_student_subject, {
        foreignKey: 'semester',
        as: 'parStudentSubjects',
      });
      semester.hasMany(models.ElectiveBasket, {
        foreignKey: 'semester',
        as: 'electiveBaskets',
      });
    }
  }

  semester.init(
    {
      semester: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'semester',
      tableName: 'semesters',
    }
  );

  return semester;
};
