'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('fine_assigneds');

    if (table.par_student_personal_information_id) {
      await queryInterface.removeColumn(
        'fine_assigneds',
        'par_student_personal_information_id'
      );
    }

    if (!table.student_reg_no) {
      await queryInterface.addColumn('fine_assigneds', 'student_reg_no', {
        type: Sequelize.BIGINT,
        allowNull: false,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('fine_assigneds');

    if (table.student_reg_no) {
      await queryInterface.removeColumn('fine_assigneds', 'student_reg_no');
    }

    if (!table.par_student_personal_information_id) {
      await queryInterface.addColumn(
        'fine_assigneds',
        'par_student_personal_information_id',
        {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'par_student_personal_informations',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        }
      );
    }
  },
};
