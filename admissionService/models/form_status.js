'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class form_status extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
     
    }
  }
  form_status.init({
    reg_no: DataTypes.BIGINT,
    current_step: DataTypes.INTEGER,
    form_status: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
    

  }, {
    sequelize,
    modelName: 'form_status',
  });
  return form_status;
};