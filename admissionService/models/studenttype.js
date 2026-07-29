'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class studenttype extends Model {
    static associate(models) {
      studenttype.hasMany(models.PersonalInformation, {
        foreignKey: 'student_type',
        as: 'personalInformations',
      });
      studenttype.hasMany(models.par_student_personal_information, {
        foreignKey: 'student_type',
        as: 'parPersonalInformations',
      });
      studenttype.hasMany(models.ElectiveBasket, {
        foreignKey: 'studenttype',
        as: 'electiveBaskets',
      });
    }
  }

  studenttype.init(
    {
      studenttype: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'studenttype',
      tableName: 'studenttypes',
    }
  );

  return studenttype;
};
