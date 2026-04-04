'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable(
      'par_student_personal_informations'
    );
    if (table.feegroupid) return;

    await queryInterface.addColumn(
      'par_student_personal_informations',
      'feegroupid',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'feegroups',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    );
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable(
      'par_student_personal_informations'
    );
    if (!table.feegroupid) return;

    await queryInterface.removeColumn(
      'par_student_personal_informations',
      'feegroupid'
    );
  }
};
