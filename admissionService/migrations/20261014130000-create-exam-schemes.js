'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exam_schemes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      exam_name_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'exam_names', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'class_masters', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      term_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'terms', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      program_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'Programs', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      semester_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'semesters', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('exam_schemes', {
      fields: ['class_id', 'term_id'],
      name: 'idx_exam_schemes_class_term',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('exam_schemes');
  },
};
