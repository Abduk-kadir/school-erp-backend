'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('holidar_masters');
    if (table.remark && !table.holiday) {
      await queryInterface.renameColumn('holidar_masters', 'remark', 'holiday');
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('holidar_masters');
    if (table.holiday && !table.remark) {
      await queryInterface.renameColumn('holidar_masters', 'holiday', 'remark');
    }
  },
};
