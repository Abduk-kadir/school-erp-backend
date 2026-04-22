'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_fines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      reg_no: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      class: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'class_masters',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      actualfineamount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      assignedfineamount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      paidfineamount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      reciept_no: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('student_fines');
  },
};
