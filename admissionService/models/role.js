'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.RolePermission, {
        foreignKey: 'role_id',
        as: 'permissions',
      });
      Role.hasMany(models.StaffRegistration, {
        foreignKey: 'role_id',
        as: 'staffMembers',
      });
    }
  }

  Role.init(
    {
      role_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: DataTypes.STRING,
      is_super_admin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'roles',
    }
  );

  return Role;
};
