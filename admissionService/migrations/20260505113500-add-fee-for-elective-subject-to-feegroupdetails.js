'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('feegroupdetails', 'fee_for', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('feegroupdetails', 'is_elective', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('feegroupdetails', 'subject_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Subjects',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('feegroupdetails', 'subject_id');
    await queryInterface.removeColumn('feegroupdetails', 'is_elective');
    await queryInterface.removeColumn('feegroupdetails', 'fee_for');
  }
};

