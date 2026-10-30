'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_marks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT,
      },
      result_mark_entry_list_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'result_mark_entry_lists', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      exam_assessment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'exam_assessments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      assessment_component_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'assessment_components', key: 'id' },
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
      marks: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
      },
      grade: {
        type: Sequelize.STRING(10),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('present', 'absent', 'exempt'),
        allowNull: false,
        defaultValue: 'present',
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

    await queryInterface.addIndex('student_marks', {
      fields: ['student_id', 'exam_assessment_id', 'assessment_component_id'],
      unique: true,
      name: 'uk_student_marks_student_assessment_component',
    });
    await queryInterface.addIndex('student_marks', {
      fields: ['result_mark_entry_list_id', 'student_id'],
      name: 'idx_student_marks_entry_list_student',
    });
    await queryInterface.addIndex('student_marks', {
      fields: ['exam_assessment_id'],
      name: 'idx_student_marks_assessment',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('student_marks');
  },
};
