'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ElectiveBaskets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      classId: {
        type: Sequelize.INTEGER
      },
      semester: {
        type: Sequelize.INTEGER
      },
      basketName: {
        type: Sequelize.STRING
      },
      minChoices: {
        type: Sequelize.INTEGER
      },
      maxChoices: {
        type: Sequelize.INTEGER
      },
      exactChoices: {
        type: Sequelize.INTEGER
      },
      isMandatory: {
        type: Sequelize.BOOLEAN
      },
      description: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
    await queryInterface.addConstraint('ElectiveBaskets', {
      fields: ['classId'],
      type: 'foreign key',
      name: 'fk_elective_baskets_class_id',
      references: {
        table: 'class_masters',
        field: 'id',          
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ElectiveBaskets');
  }
};