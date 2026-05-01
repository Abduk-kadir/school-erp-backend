'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    // feeheadid was removed from studentfeegroupdetailpricesplits; kept as no-op for migration history.
  },

  async down(queryInterface) {
    const tableName = 'studentfeegroupdetailpricesplits';
    const fkName = 'studentfeegroupdetailpricesplits_feeheadid_fk';
    const indexName = 'studentfeegroupdetailpricesplits_feeheadid_idx';

    let table;
    try {
      table = await queryInterface.describeTable(tableName);
    } catch (e) {
      return;
    }

    if (!table.feeheadid) return;

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
  },
};
