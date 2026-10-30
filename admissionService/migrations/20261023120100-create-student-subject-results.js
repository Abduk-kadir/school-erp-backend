'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const marks = () => ({ type: Sequelize.DECIMAL(7, 2), allowNull: true });
    const grade = () => ({ type: Sequelize.STRING(10), allowNull: true });

    await queryInterface.createTable('student_subject_results', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      exam_scheme_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'exam_schemes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      student_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'par_student_personal_informations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Subjects', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      exam_configure_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'exam_configures', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      formative_obtained: marks(),
      formative_max: marks(),
      formative_converted: marks(),
      formative_grade: grade(),
      formative_pass: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      summative_obtained: marks(),
      summative_max: marks(),
      summative_converted: marks(),
      summative_grade: grade(),
      summative_pass: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      total_obtained: marks(),
      total_max: marks(),
      total_grade: grade(),
      grade_point: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
      },
      is_pass: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      is_included_in_total: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_absent: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex('student_subject_results', {
      fields: ['exam_scheme_id', 'student_id', 'subject_id'],
      unique: true,
      name: 'uk_student_subject_results_scheme_student_subject',
    });
    await queryInterface.addIndex('student_subject_results', {
      fields: ['student_id'],
      name: 'idx_student_subject_results_student',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('student_subject_results');
  },
};
