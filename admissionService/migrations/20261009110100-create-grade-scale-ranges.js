'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('grade_scale_ranges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      grade_scale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'grade_scales', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      grade: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      min_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      max_percent: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      grade_point: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
      },
      is_fail: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.dropTable('grade_scale_ranges');
  },
};
