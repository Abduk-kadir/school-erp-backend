'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    // reg_no was removed from studentfeegroupdetailpricesplits; kept as no-op for migration history.
  },

  async down(queryInterface) {
    const tableName = 'studentfeegroupdetailpricesplits';
    let table;
    try {
      table = await queryInterface.describeTable(tableName);
    } catch (e) {
      return;
    }
    if (table.reg_no) {
      await queryInterface.removeColumn(tableName, 'reg_no');
    }
  },
};
