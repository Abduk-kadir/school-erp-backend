'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('StaffRegistrations', 'role_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('StaffRegistrations', 'role_id');
  },
};
