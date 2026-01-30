'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProgramSubjects', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      classId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      programId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      subjectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      semester: {
        type: Sequelize.INTEGER
      },
      isCompulsory: {
        type: Sequelize.BOOLEAN
      },
      basketId: {
        type: Sequelize.INTEGER
      },
      sequence: {
        type: Sequelize.INTEGER
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
     await queryInterface.addConstraint('ProgramSubjects', {
      fields: ['classId'],
      type: 'foreign key',
      name: 'fk_class_masters_class',
      references: {
        table: 'class_masters',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('ProgramSubjects', {
      fields: ['programId'],
      type: 'foreign key',
      name: 'fk_programs_program',
      references: {
        table: 'programs',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
     await queryInterface.addConstraint('ProgramSubjects', {
      fields: ['subjectId'],
      type: 'foreign key',
      name: 'fk_subjects_subject',
      references: {
        table: 'subjects',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProgramSubjects');
  }
};