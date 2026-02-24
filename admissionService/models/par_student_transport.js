'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class par_student_transport extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  par_student_transport.init({
    reg_no: DataTypes.BIGINT,
    route_id: DataTypes.INTEGER,
    sub_route_id: DataTypes.INTEGER,
    is_taken: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'par_student_transport',
  });
  return par_student_transport;
};