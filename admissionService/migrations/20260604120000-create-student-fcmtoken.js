'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_fcmtokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      studentid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'par_student_personal_informations',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      token: {
        type: Sequelize.STRING,
        allowNull: false,
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

    await queryInterface.addIndex('student_fcmtokens', ['studentid'], {
      name: 'idx_student_fcmtokens_studentid',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex(
      'student_fcmtokens',
      'idx_student_fcmtokens_studentid'
    );
    await queryInterface.dropTable('student_fcmtokens');
  },
};
