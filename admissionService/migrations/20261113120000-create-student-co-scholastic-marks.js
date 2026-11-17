'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_co_scholastic_marks', {
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
      student_reg_no: {
        type: Sequelize.BIGINT,
        allowNull: false,
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

    await queryInterface.addIndex('student_co_scholastic_marks', {
      fields: ['result_mark_entry_list_id', 'student_reg_no'],
      unique: true,
      name: 'uk_student_co_scholastic_marks_entry_list_student',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('student_co_scholastic_marks');
  },
};
