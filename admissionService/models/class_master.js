'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class class_master extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      class_master.hasMany(models.FeeGroupDetail, {
        foreignKey: 'classid',
        as: 'feeGroupDetails'
      });
      class_master.hasMany(models.FineAssigned, {
        foreignKey: 'class_id',
        as: 'fineAssignments',
      });
    }
  }
  class_master.init({
    class_name: DataTypes.STRING,
    class_code: {
      type: DataTypes.STRING,
      unique: true,
    },
    status: DataTypes.BOOLEAN,
    admission_form_fee: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'class_master',
  });
  return class_master;
};