'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Day columns ("1".."31") and the columns after them are added one by one,
    // because numeric keys in a createTable object would be placed before `id`.
    await queryInterface.createTable('monthlyattendances', {
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
      year: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      month_number: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
    });

    for (let day = 1; day <= 31; day++) {
      await queryInterface.addColumn('monthlyattendances', String(day), {
        type: Sequelize.STRING,
      });
    }

    const trailingColumns = [
      ['total_present', { type: Sequelize.INTEGER }],
      ['total_absent', { type: Sequelize.INTEGER }],
      ['total_workingdays', { type: Sequelize.INTEGER }],
      ['present_percent', { type: Sequelize.INTEGER }],
      ['createdAt', { allowNull: false, type: Sequelize.DATE }],
      ['updatedAt', { allowNull: false, type: Sequelize.DATE }],
    ];
    for (const [name, definition] of trailingColumns) {
      await queryInterface.addColumn('monthlyattendances', name, definition);
    }

    await queryInterface.addIndex('monthlyattendances', {
      fields: ['reg_no', 'year', 'month_number'],
      unique: true,
      name: 'uk_monthlyattendance_reg_no_year_month',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('monthlyattendances');
  },
};
