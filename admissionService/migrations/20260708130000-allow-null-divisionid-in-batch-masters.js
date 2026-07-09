'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('batch_masters', 'divisionid', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'division_masters',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('batch_masters', 'divisionid', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'division_masters',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },
};
