'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('FeeCollections');

    // Make consession boolean (existing DB might have it as INTEGER)
    if (table.consession) {
      await queryInterface.changeColumn('FeeCollections', 'consession', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      });
    } else {
      await queryInterface.addColumn('FeeCollections', 'consession', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      });
    }

    if (!table.consessionamount) {
      await queryInterface.addColumn('FeeCollections', 'consessionamount', {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('FeeCollections');
    if (table.consessionamount) {
      await queryInterface.removeColumn('FeeCollections', 'consessionamount');
    }
    // Don't revert consession type automatically (could break existing data).
  }
};

