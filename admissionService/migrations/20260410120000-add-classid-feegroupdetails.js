'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('feegroupdetails');
    if (table.classid) return;

    await queryInterface.addColumn('feegroupdetails', 'classid', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'class_masters',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('feegroupdetails');
    if (!table.classid) return;
    await queryInterface.removeColumn('feegroupdetails', 'classid');
  }
};
