'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class classWiseSchool extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       classWiseSchool.belongsTo(models.class_master, {
        foreignKey: 'class_id',
        as: 'class',
      });
    }
  }
  classWiseSchool.init({
    class_id: DataTypes.INTEGER,
    school_name: DataTypes.STRING,
    address: DataTypes.STRING,
    contact_number: DataTypes.BIGINT,
    email: DataTypes.STRING,
    gst_number: DataTypes.STRING,
    logo: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'classWiseSchool',
  });
  return classWiseSchool;
};