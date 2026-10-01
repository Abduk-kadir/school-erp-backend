'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Module extends Model {
    static associate(models) {
      Module.belongsTo(models.Module, {
        foreignKey: 'parent_id',
        as: 'parent',
      });
      Module.hasMany(models.Module, {
        foreignKey: 'parent_id',
        as: 'children',
      });
      Module.hasMany(models.RolePermission, {
        foreignKey: 'module_id',
        as: 'rolePermissions',
      });
      Module.hasMany(models.StaffPermission, {
        foreignKey: 'module_id',
        as: 'staffPermissions',
      });
    }
  }

  Module.init(
    {
      module_key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      module_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      group_name: DataTypes.STRING,
      parent_id: DataTypes.INTEGER,
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      allowed_actions: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'display,add,edit,delete,view,import,export',
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Module',
      tableName: 'modules',
    }
  );

  return Module;
};
