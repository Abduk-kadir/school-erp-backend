'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class seatAllotment extends Model {
   
    static associate(models) {
      seatAllotment.belongsTo(models.class_master, {
        foreignKey: 'class_id',
        as: 'class',
      });

      seatAllotment.belongsTo(models.Category, {
        foreignKey: 'admission_category',
        as: 'category',
      });
    }
  }
  seatAllotment.init({
    class_id: DataTypes.INTEGER,
    admission_category: DataTypes.STRING,
    no_seat: DataTypes.INTEGER,
    is_merit_list: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'seatAllotment',
  });
  return seatAllotment;
};