'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'studentfeegroupdetailpricesplits';

    let table;
    try {
      table = await queryInterface.describeTable(tableName);
    } catch (e) {
      return;
    }

    if (!table.remark) {
      await queryInterface.addColumn(tableName, 'remark', {
        type: Sequelize.TEXT,
        allowNull: true,
        after: 'student_installment_id',
      });
    }
  },

  async down(queryInterface) {
    const tableName = 'studentfeegroupdetailpricesplits';

    let table;
    try {
      table = await queryInterface.describeTable(tableName);
    } catch (e) {
      return;
    }

    if (table.remark) {
      await queryInterface.removeColumn(tableName, 'remark');
    }
  },
};
