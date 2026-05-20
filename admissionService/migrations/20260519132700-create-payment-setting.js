'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PaymentSettings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      paymentGateway: {
        type: Sequelize.STRING,
        allowNull: true
      },
      classid: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'class_masters',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      merchantId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      key: {
        type: Sequelize.STRING,
        allowNull: true
      },
      accessCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      feetype: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'FeesTypes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      isSplit: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
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

  async down(queryInterface) {
    await queryInterface.dropTable('PaymentSettings');
  }
};
