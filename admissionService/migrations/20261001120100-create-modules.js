'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('modules', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      module_key: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      module_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      group_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'modules',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      allowed_actions: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'display,add,edit,delete,view,import,export',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('modules');
  },
};
