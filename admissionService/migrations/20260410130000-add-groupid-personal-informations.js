'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('PersonalInformations');
    if (table.groupid) return;

    await queryInterface.addColumn('PersonalInformations', 'groupid', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'feegroups',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('PersonalInformations');
    if (!table.groupid) return;
    await queryInterface.removeColumn('PersonalInformations', 'groupid');
  }
};
