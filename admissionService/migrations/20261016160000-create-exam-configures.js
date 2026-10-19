'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exam_configures', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      exam_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'exam_schemes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Subjects', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      grade_scale_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'grade_scales', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      is_separate_passing: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_included_in_total: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      mark_or_grade: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      formative_total: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      formative_passing: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      formative_ratio: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      summative_total: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      summative_passing: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      summative_ratio: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      total_mark: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      total_passing: {
        type: Sequelize.INTEGER,
        allowNull: true,
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

    await queryInterface.addIndex('exam_configures', {
      fields: ['exam_id', 'class_id', 'term_id', 'subject_id'],
      unique: true,
      name: 'uk_exam_configures_exam_class_term_subject',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('exam_configures');
  },
};
