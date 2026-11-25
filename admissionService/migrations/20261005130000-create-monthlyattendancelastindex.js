'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('monthlyattendancelastindexes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lastreadvalue: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      lastcronrecordid: {
        type: Sequelize.BIGINT,
        allowNull: false,
        defaultValue: 0,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('monthlyattendancelastindexes');
  },
};
