'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('feegroupdetails', 'iselectivesubject');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('feegroupdetails', 'iselectivesubject', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  }
};

