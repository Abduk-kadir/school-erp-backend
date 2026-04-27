'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'FeeRecordMonthlies';
    const table = await queryInterface.describeTable(tableName);

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    // Rename <m>_paid -> <m>_total_paid and <m>_due -> <m>_total_due
    for (const m of months) {
      const paidOld = `${m}_paid`;
      const paidNew = `${m}_total_paid`;
      if (table[paidOld] && !table[paidNew]) {
        await queryInterface.renameColumn(tableName, paidOld, paidNew);
      }

      const dueOld = `${m}_due`;
      const dueNew = `${m}_total_due`;
      if (table[dueOld] && !table[dueNew]) {
        await queryInterface.renameColumn(tableName, dueOld, dueNew);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'FeeRecordMonthlies';
    const table = await queryInterface.describeTable(tableName);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    for (const m of months) {
      const paidOld = `${m}_paid`;
      const paidNew = `${m}_total_paid`;
      if (table[paidNew] && !table[paidOld]) {
        await queryInterface.renameColumn(tableName, paidNew, paidOld);
      }

      const dueOld = `${m}_due`;
      const dueNew = `${m}_total_due`;
      if (table[dueNew] && !table[dueOld]) {
        await queryInterface.renameColumn(tableName, dueNew, dueOld);
      }
    }

  },
};

