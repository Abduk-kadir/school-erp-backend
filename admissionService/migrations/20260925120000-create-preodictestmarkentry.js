'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('preodictestmarkentries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      preodictest_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'preodictests',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reg_no: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      mark_obtained: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      date: {
        type: Sequelize.DATEONLY,
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

    await queryInterface.addIndex('preodictestmarkentries', {
      fields: ['preodictest_id', 'reg_no'],
      unique: true,
      name: 'uk_preodictestmarkentry_test_reg_no',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('preodictestmarkentries');
  },
};
