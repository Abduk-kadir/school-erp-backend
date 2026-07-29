'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('PersonalInformations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email:{
        type:Sequelize.STRING
      },
      reg_no:{
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
      mother_name:{
         type: Sequelize.STRING

      },
      class: {
        type: Sequelize.STRING
      },
      division: {
        type: Sequelize.STRING
      },
      cast:{
        type:Sequelize.INTEGER
      },
      groupid:{
        type:Sequelize.INTEGER,

      },
      contact_number: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      dob: {
        type: Sequelize.STRING
      },
      blood_group: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      student_type:{
        type:Sequelize.INTEGER
      },
      gender:{
        type:Sequelize.STRING
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('PersonalInformations');
  }
};