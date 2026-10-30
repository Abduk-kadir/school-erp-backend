'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_exam_results', {
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
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'class_masters', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      division_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'division_masters', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      grand_total: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
      },
      grand_max: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
      },
      percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      overall_grade: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      result_status: {
        type: Sequelize.ENUM('pass', 'fail', 'incomplete'),
        allowNull: false,
        defaultValue: 'incomplete',
      },
      class_rank: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      processed_at: {
        type: Sequelize.DATE,
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

    await queryInterface.addIndex('student_exam_results', {
      fields: ['exam_scheme_id', 'student_id'],
      unique: true,
      name: 'uk_student_exam_results_scheme_student',
    });
    await queryInterface.addIndex('student_exam_results', {
      fields: ['exam_scheme_id', 'class_id', 'division_id'],
      name: 'idx_student_exam_results_scheme_class_division',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('student_exam_results');
  },
};
