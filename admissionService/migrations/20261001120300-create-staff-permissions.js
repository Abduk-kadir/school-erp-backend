'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // NULL = inherit from role, 1 = grant, 0 = deny
    const action = () => ({
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: null,
    });

    await queryInterface.createTable('staff_permissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      staff_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'StaffRegistrations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      module_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'modules',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      can_display: action(),
      can_add: action(),
      can_edit: action(),
      can_delete: action(),
      can_view: action(),
      can_import: action(),
      can_export: action(),
      granted_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('staff_permissions', ['staff_id', 'module_id'], {
      unique: true,
      name: 'uk_staff_permissions_staff_module',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('staff_permissions');
  },
};
