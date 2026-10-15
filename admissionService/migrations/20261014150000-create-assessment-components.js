'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('assessment_components', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      exam_assessment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'exam_assessments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      component_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'components', key: 'id' },
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

    await queryInterface.addIndex('assessment_components', {
      fields: ['exam_assessment_id', 'component_id'],
      unique: true,
      name: 'uk_assessment_components_assessment_component',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('assessment_components');
  },
};
