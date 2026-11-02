'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const marks = () => ({ type: Sequelize.DECIMAL(7, 2), allowNull: true });

    await queryInterface.createTable('student_head_results', {
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
      exam_assessment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'exam_assessments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      obtained: marks(),
      max_marks: marks(),
      converted: marks(),
      grade: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      is_pass: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
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

    await queryInterface.addIndex('student_head_results', {
      fields: ['exam_scheme_id', 'student_id', 'exam_assessment_id'],
      unique: true,
      name: 'uk_student_head_results_scheme_student_assessment',
    });
    await queryInterface.addIndex('student_head_results', {
      fields: ['exam_scheme_id', 'subject_id'],
      name: 'idx_student_head_results_scheme_subject',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('student_head_results');
  },
};
