'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('par_student_personal_informations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      reg_no: {
        type: Sequelize.BIGINT
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      father_name: {
        type: Sequelize.STRING
      },
      class: {
        type: Sequelize.INTEGER
      },
      division: {
        type: Sequelize.INTEGER
      },
      contact_number: {
        type: Sequelize.STRING
      },
      cast:{
        type:Sequelize.INTEGER
      },
      password: {
        type: Sequelize.STRING
      },
      dob: {
        type: Sequelize.STRING
      },
      blood_groop: {
        type: Sequelize.STRING
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('par_student_personal_informations');
  }
};