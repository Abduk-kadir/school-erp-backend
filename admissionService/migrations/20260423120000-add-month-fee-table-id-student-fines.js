'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('student_fines');

    if (!table.month) {
      await queryInterface.addColumn('student_fines', 'month', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    if (!table.fee_table_id) {
      await queryInterface.addColumn('student_fines', 'fee_table_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('student_fines');

    if (table.fee_table_id) {
      await queryInterface.removeColumn('student_fines', 'fee_table_id');
    }

    if (table.month) {
      await queryInterface.removeColumn('student_fines', 'month');
    }
  },
};
