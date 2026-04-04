'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('feegroupdetails');
    if (table.startmonth) return;

    await queryInterface.addColumn('feegroupdetails', 'startmonth', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Calendar month 1–12 when this schedule starts'
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('feegroupdetails');
    if (!table.startmonth) return;

    await queryInterface.removeColumn('feegroupdetails', 'startmonth');
  }
};
