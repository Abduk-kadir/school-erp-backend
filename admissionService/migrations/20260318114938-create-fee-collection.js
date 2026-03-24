'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FeeCollections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reg_no: {
        type: Sequelize.BIGINT
      },
      client_txt_id: {
        type: Sequelize.STRING
      },
      reciept_no: {
        type: Sequelize.STRING
      },
      transaction_no: {
        type: Sequelize.STRING
      },
      failure_message: {
        type: Sequelize.STRING
      },
      card_name: {
        type: Sequelize.STRING
      },
      payment_mode: {
        type: Sequelize.STRING
      },
      added_by: {
        type: Sequelize.STRING
      },
      role_id: {
        type: Sequelize.INTEGER
      },
      fine: {
        type: Sequelize.STRING
      },
      consession: {
        type: Sequelize.INTEGER
      },
      discount_type_id: {
        type: Sequelize.INTEGER
      },
      total: {
        type: Sequelize.INTEGER
      },
      total_paid:{
        type:Sequelize.INTEGER
      },
      payment: {
        type: Sequelize.INTEGER
      },
      balance: {
        type: Sequelize.INTEGER
      },
      remark: {
        type: Sequelize.STRING
      },
      payment_type: {
        type: Sequelize.STRING
      },
      dd_number: {
        type: Sequelize.STRING
      },
      dd_date: {
        type: Sequelize.DATE
      },
      check_no: {
        type: Sequelize.STRING
      },
      ref_no: {
        type: Sequelize.STRING
      },
      check_date: {
        type: Sequelize.DATE
      },
      check_name: {
        type: Sequelize.STRING
      },
      bank_id: {
        type: Sequelize.INTEGER
      },
      start_month: {
        type: Sequelize.INTEGER
      },
      paid_and_unpai_month: {
        type: Sequelize.STRING
      },
      extra_fee: {
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE
      },
      split_flag: {
        type: Sequelize.INTEGER
      },
      raw_data: {
        type: Sequelize.STRING
      },
      installment: {
        type: Sequelize.INTEGER
      },
      split_response: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('FeeCollections');
  }
};