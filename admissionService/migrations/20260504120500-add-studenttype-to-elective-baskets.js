'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('ElectiveBaskets');
    if (!table.studenttype) {
      await queryInterface.addColumn('ElectiveBaskets', 'studenttype', {
        type: Sequelize.ENUM('added', 'unadded', 'both'),
        allowNull: true,
        defaultValue: null,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('ElectiveBaskets', 'studenttype');
  },
};

