'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class StaffPermission extends Model {
    static associate(models) {
      StaffPermission.belongsTo(models.StaffRegistration, {
        foreignKey: 'staff_id',
        as: 'staff',
      });
      StaffPermission.belongsTo(models.Module, {
        foreignKey: 'module_id',
        as: 'module',
      });
    }
  }

  // NULL = inherit from role, true = grant, false = deny
  const action = () => ({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: null,
  });

  StaffPermission.init(
    {
      staff_id: {
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
      granted_by: DataTypes.INTEGER,
      reason: DataTypes.STRING,
      expires_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: 'StaffPermission',
      tableName: 'staff_permissions',
      indexes: [
        {
          unique: true,
          fields: ['staff_id', 'module_id'],
          name: 'uk_staff_permissions_staff_module',
        },
      ],
    }
  );

  return StaffPermission;
};
