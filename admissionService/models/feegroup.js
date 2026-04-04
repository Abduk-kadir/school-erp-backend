'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FeeGroup extends Model {
    static associate(models) {
      FeeGroup.hasMany(models.FeeGroupHead, {
        foreignKey: 'groupid',
        as: 'feeGroupHeads'
      });
      FeeGroup.hasMany(models.FeeGroupDetail, {
        foreignKey: 'feegroupid',
        as: 'feeGroupDetails'
      });
      FeeGroup.hasMany(models.par_student_personal_information, {
        foreignKey: 'feegroupid',
        as: 'parStudentPersonalInformations'
      });
    }
  }
  FeeGroup.init({
    groupname: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'FeeGroup',
    tableName: 'feegroups',
    indexes: [
      {
        fields: ['groupname'],
        name: 'feegroups_groupname_idx'
      }
    ]
  });
  return FeeGroup;
};
