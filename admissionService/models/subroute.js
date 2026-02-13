'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SubRoute extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SubRoute.belongsTo(models.Route,{
        foreignKey:'route_id',
        as:'Route',
        onDelete:'CASCADE',
        onUpdate:'CASCADE'
      })
    }
  }
  SubRoute.init({
    route_id: DataTypes.INTEGER,
    sub_route_name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'SubRoute',
  });
  return SubRoute;
};