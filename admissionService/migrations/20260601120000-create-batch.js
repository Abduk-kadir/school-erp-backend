'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('batches', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      batch_name: {
        type: Sequelize.STRING
      },
      starttime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      endtime: {
        type: Sequelize.TIME,
        allowNull: true
      },
      personname: {
        type: Sequelize.STRING,
        allowNull: true
      },
      contactperson: {
        type: Sequelize.BIGINT,
        allowNull: true
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
    await queryInterface.dropTable('batches');
  }
};
