'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const tableName = 'studentfeegroupdetailpricesplits';
    const fkName = 'studentfeegroupdetailpricesplits_feeheadid_fk';
    const indexName = 'studentfeegroupdetailpricesplits_feeheadid_idx';

    let table;
    try {
      table = await queryInterface.describeTable(tableName);
    } catch (e) {
      return;
    }

    if (table.jan_split1 && !table.jan_total_paid) {
      if (table.feeheadid) {
        try {
          await queryInterface.removeConstraint(tableName, fkName);
        } catch (e) {
          // ignore
        }
        try {
          await queryInterface.removeIndex(tableName, indexName);
        } catch (e) {
          // ignore
        }
        await queryInterface.removeColumn(tableName, 'feeheadid');
        table = await queryInterface.describeTable(tableName);
      }
      if (table.reg_no) {
        await queryInterface.removeColumn(tableName, 'reg_no');
      }
      return;
    }

    if (table.feeheadid) {
      try {
        await queryInterface.removeConstraint(tableName, fkName);
      } catch (e) {
        // ignore
      }
      try {
        await queryInterface.removeIndex(tableName, indexName);
      } catch (e) {
        // ignore
      }
      await queryInterface.removeColumn(tableName, 'feeheadid');
      table = await queryInterface.describeTable(tableName);
    }

    if (table.reg_no) {
      await queryInterface.removeColumn(tableName, 'reg_no');
      table = await queryInterface.describeTable(tableName);
    }

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    for (const m of months) {
      const oldPaid = `${m}_total_paid`;
      const oldDue = `${m}_total_due`;
      const new1 = `${m}_split1`;
      const new2 = `${m}_split2`;
      if (table[oldPaid] && !table[new1]) {
        await queryInterface.renameColumn(tableName, oldPaid, new1);
        table = await queryInterface.describeTable(tableName);
      }
      if (table[oldDue] && !table[new2]) {
        await queryInterface.renameColumn(tableName, oldDue, new2);
        table = await queryInterface.describeTable(tableName);
      }
    }
  },

  async down() {
    // Irreversible schema refactor; use db backup or manual SQL if rollback is required.
  },
};
