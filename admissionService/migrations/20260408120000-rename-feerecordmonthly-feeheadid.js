'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('FeeRecordMonthlies');

    if (table.fee_head && !table.feeheadid) {
      await queryInterface.renameColumn('FeeRecordMonthlies', 'fee_head', 'feeheadid');
    }

    // Ensure correct type (old schema used STRING)
    const updated = await queryInterface.describeTable('FeeRecordMonthlies');
    if (updated.feeheadid) {
      await queryInterface.changeColumn('FeeRecordMonthlies', 'feeheadid', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('FeeRecordMonthlies');

    if (table.feeheadid && !table.fee_head) {
      // revert name
      await queryInterface.renameColumn('FeeRecordMonthlies', 'feeheadid', 'fee_head');
    }

    const updated = await queryInterface.describeTable('FeeRecordMonthlies');
    if (updated.fee_head) {
      // revert type
      await queryInterface.changeColumn('FeeRecordMonthlies', 'fee_head', {
        type: Sequelize.STRING,
        allowNull: true
      });
    }
  }
};

