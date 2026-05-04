'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Make column nullable + add "both" option.
    // Note: On MySQL, changing ENUM also updates allowed values.
    await queryInterface.changeColumn('ElectiveBaskets', 'studenttype', {
      type: Sequelize.ENUM('added', 'unadded', 'both'),
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert enum (keep nullable, no default)
    await queryInterface.changeColumn('ElectiveBaskets', 'studenttype', {
      type: Sequelize.ENUM('added', 'unadded'),
      allowNull: true,
      defaultValue: null,
    });
  },
};

