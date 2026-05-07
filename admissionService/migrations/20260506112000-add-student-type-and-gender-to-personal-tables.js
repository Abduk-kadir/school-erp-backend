'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const personal = await queryInterface.describeTable('PersonalInformations');
    if (!personal.student_type) {
      await queryInterface.addColumn('PersonalInformations', 'student_type', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
    if (!personal.gender) {
      await queryInterface.addColumn('PersonalInformations', 'gender', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }

    const parPersonal = await queryInterface.describeTable(
      'par_student_personal_informations'
    );
    if (!parPersonal.student_type) {
      await queryInterface.addColumn(
        'par_student_personal_informations',
        'student_type',
        {
          type: Sequelize.STRING,
          allowNull: true,
        }
      );
    }
    if (!parPersonal.gender) {
      await queryInterface.addColumn('par_student_personal_informations', 'gender', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  async down(queryInterface) {
    const personal = await queryInterface.describeTable('PersonalInformations');
    if (personal.gender) await queryInterface.removeColumn('PersonalInformations', 'gender');
    if (personal.student_type) {
      await queryInterface.removeColumn('PersonalInformations', 'student_type');
    }

    const parPersonal = await queryInterface.describeTable(
      'par_student_personal_informations'
    );
    if (parPersonal.gender) {
      await queryInterface.removeColumn('par_student_personal_informations', 'gender');
    }
    if (parPersonal.student_type) {
      await queryInterface.removeColumn(
        'par_student_personal_informations',
        'student_type'
      );
    }
  },
};

