'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('feegroupdetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      feegroupid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'feegroups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      scheduletype: {
        type: Sequelize.ENUM(
          'monthly',
          'quarterly',
          'half_yearly',
          'annually',
          'one_time'
        ),
        allowNull: false,
        defaultValue: 'monthly'
      },
      isbackwardclass: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      iselectivesubject: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      cast:{
        type:Sequelize.INTEGER
      },
      gender:{
        type:Sequelize.STRING
      },
      startmonth: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Calendar month 1–12 when this schedule starts'
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
    await queryInterface.dropTable('feegroupdetails');
  }
};
