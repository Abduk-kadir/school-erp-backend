'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FeeRecordMonthlies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reg_no: {
        type: Sequelize.BIGINT
      },
      feeheadid: {
        type: Sequelize.INTEGER
      },
      fee_table_id: {
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      jan_total: {
        type: Sequelize.DECIMAL
      },
      jan_paid: {
        type: Sequelize.DECIMAL
      },
      jan_total_paid: {
        type: Sequelize.DECIMAL
      },
      jan_total_due: {
        type: Sequelize.DECIMAL
      },
      feb_total: {
        type: Sequelize.DECIMAL
      },
      feb_paid: {
        type: Sequelize.DECIMAL
      },
      feb_total_paid: {
        type: Sequelize.DECIMAL
      },
      feb_total_due: {
        type: Sequelize.DECIMAL
      },
      mar_total: {
        type: Sequelize.DECIMAL
      },
      mar_paid: {
        type: Sequelize.DECIMAL
      },
      mar_total_paid: {
        type: Sequelize.DECIMAL
      },
      mar_total_due: {
        type: Sequelize.DECIMAL
      },
      apr_total: {
        type: Sequelize.DECIMAL
      },
      apr_paid: {
        type: Sequelize.DECIMAL
      },
      apr_total_paid: {
        type: Sequelize.DECIMAL
      },
      apr_total_due: {
        type: Sequelize.DECIMAL
      },
      may_total: {
        type: Sequelize.DECIMAL
      },
      may_paid: {
        type: Sequelize.DECIMAL
      },
      may_total_paid: {
        type: Sequelize.DECIMAL
      },
      may_total_due: {
        type: Sequelize.DECIMAL
      },
      jun_total: {
        type: Sequelize.DECIMAL
      },
      jun_paid: {
        type: Sequelize.DECIMAL
      },
      jun_total_paid: {
        type: Sequelize.DECIMAL
      },
      jun_total_due: {
        type: Sequelize.DECIMAL
      },
      jul_total: {
        type: Sequelize.DECIMAL
      },
      jul_paid: {
        type: Sequelize.DECIMAL
      },
      jul_total_paid: {
        type: Sequelize.DECIMAL
      },
      jul_total_due: {
        type: Sequelize.DECIMAL
      },
      aug_total: {
        type: Sequelize.DECIMAL
      },
      aug_paid: {
        type: Sequelize.DECIMAL
      },
      aug_total_paid: {
        type: Sequelize.DECIMAL
      },
      aug_total_due: {
        type: Sequelize.DECIMAL
      },
      sep_total: {
        type: Sequelize.DECIMAL
      },
      sep_paid: {
        type: Sequelize.DECIMAL
      },
      sep_total_paid: {
        type: Sequelize.DECIMAL
      },
      sep_total_due: {
        type: Sequelize.DECIMAL
      },
      oct_total: {
        type: Sequelize.DECIMAL
      },
      oct_paid: {
        type: Sequelize.DECIMAL
      },
      oct_total_paid: {
        type: Sequelize.DECIMAL
      },
      oct_total_due: {
        type: Sequelize.DECIMAL
      },
      nov_total: {
        type: Sequelize.DECIMAL
      },
      nov_paid: {
        type: Sequelize.DECIMAL
      },
      nov_total_paid: {
        type: Sequelize.DECIMAL
      },
      nov_total_due: {
        type: Sequelize.DECIMAL
      },
      dec_total: {
        type: Sequelize.DECIMAL
      },
      dec_paid: {
        type: Sequelize.DECIMAL
      },
      dec_total_paid: {
        type: Sequelize.DECIMAL
      },
      dec_total_due: {
        type: Sequelize.DECIMAL
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('FeeRecordMonthlies');
  }
};