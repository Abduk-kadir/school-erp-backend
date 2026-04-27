'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'FeeRecordMonthlies';
    const table = await queryInterface.describeTable(tableName);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    // remove accidental column (if present)
    if (table.payment) {
      await queryInterface.removeColumn(tableName, 'payment');
    }

    // add back <m>_paid columns (if missing)
    for (const m of months) {
      const col = `${m}_paid`;
      if (!table[col]) {
        await queryInterface.addColumn(tableName, col, {
          type: Sequelize.DECIMAL,
          allowNull: true,
        });
      }
    }
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'FeeRecordMonthlies';
    const table = await queryInterface.describeTable(tableName);
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    for (const m of months) {
      const col = `${m}_paid`;
      if (table[col]) {
        await queryInterface.removeColumn(tableName, col);
      }
    }

    // re-add payment (rollback only)
    const updated = await queryInterface.describeTable(tableName);
    if (!updated.payment) {
      await queryInterface.addColumn(tableName, 'payment', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
};

