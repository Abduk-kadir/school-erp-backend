'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StudentTransport extends Model {
   
    static associate(models) {
     StudentTransport.belongsTo(models.SubRoute,{
        foreignKey:'sub_route_id',
        as:'SubRoute',
        onDelete:'CASCADE',
        onUpdate:'CASCADE'
      })
      
      StudentTransport.belongsTo(models.Route,{
        foreignKey:'route_id',
        as:'Route',
        onDelete:'CASCADE',
        onUpdate:'CASCADE'
      })
      StudentTransport.belongsTo(models.PersonalInformation,{
        foreignKey:'reg_no',
        as:'PersonalInformation',
        onDelete:'CASCADE',
        onUpdate:'CASCADE'
      })
      
    }
    
  }
  StudentTransport.init({
    reg_no: DataTypes.INTEGER,
    route_id: DataTypes.INTEGER,
    sub_route_id: DataTypes.INTEGER,
    is_taken: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'StudentTransport',
  });
  return StudentTransport;
};