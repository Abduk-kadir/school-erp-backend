'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Fields', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      stageId: {
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      label: {
        type: Sequelize.STRING
      },
      fieldTypeId: {
        type: Sequelize.INTEGER
      },
      isRequired: {
        type: Sequelize.BOOLEAN
      },
      placeholder: {
        type: Sequelize.STRING
      },
      defaultValue: {
        type: Sequelize.STRING
      },
      validationRules: {
        type: Sequelize.JSON
      },
      order: {
        type: Sequelize.INTEGER
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
    await queryInterface.dropTable('Fields');
  }
};