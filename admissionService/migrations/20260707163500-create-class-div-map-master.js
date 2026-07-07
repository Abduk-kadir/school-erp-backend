'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('class_div_map_masters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      classid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'class_masters',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      divisionid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'division_masters',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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

    await queryInterface.addIndex('class_div_map_masters', ['classid', 'divisionid'], {
      unique: true,
      name: 'class_div_map_masters_classid_divisionid_unique',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('class_div_map_masters');
  },
};
