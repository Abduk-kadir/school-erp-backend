'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Fines', {
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
      fine_for_month: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Month/period this fine applies to (e.g. YYYY-MM or label)',
      },
      fine_type: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'onetime'),
        allowNull: false,
      },
      fine_start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      fine_amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
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
    await queryInterface.dropTable('Fines');
  },
};
