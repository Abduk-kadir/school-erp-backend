'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exam_assessments', {
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
      subject_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'subjects', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      code: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      component_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'components', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      group_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'assessment_groups', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      max_marks: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: false,
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addIndex('exam_assessments', {
      fields: ['exam_scheme_id', 'subject_id', 'code'],
      unique: true,
      name: 'uk_exam_assessments_scheme_subject_code',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('exam_assessments');
  },
};
