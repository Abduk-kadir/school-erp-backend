'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('fine_assigneds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'class_masters',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      student_reg_no: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      fine_for_month: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      fine_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      fine_pay_till_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      remark: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('fine_assigneds');
  },
};
