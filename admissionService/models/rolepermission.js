'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class RolePermission extends Model {
    static associate(models) {
      RolePermission.belongsTo(models.Role, {
        foreignKey: 'role_id',
        as: 'role',
      });
      RolePermission.belongsTo(models.Module, {
        foreignKey: 'module_id',
        as: 'module',
      });
    }
  }

  const action = () => ({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  RolePermission.init(
    {
      role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      module_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      can_display: action(),
      can_add: action(),
      can_edit: action(),
      can_delete: action(),
      can_view: action(),
      can_import: action(),
      can_export: action(),
      can_is_assign_permissions: action(),
    },
    {
      sequelize,
      modelName: 'RolePermission',
      tableName: 'role_permissions',
      indexes: [
        {
          unique: true,
          fields: ['role_id', 'module_id'],
          name: 'uk_role_permissions_role_module',
        },
      ],
    }
  );

  return RolePermission;
};
