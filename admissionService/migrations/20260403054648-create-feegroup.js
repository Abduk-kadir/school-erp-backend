'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const tableExists = tables.some(
      (t) => String(t).toLowerCase() === 'feegroups'
    );

    if (!tableExists) {
      await queryInterface.createTable('feegroups', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        groupname: {
          type: Sequelize.STRING,
          allowNull: false
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
    }

    const indexes = await queryInterface.showIndex('feegroups');
    const hasGroupNameIndex = indexes.some(
      (idx) => idx.name === 'feegroups_groupname_idx'
    );

    if (!hasGroupNameIndex) {
      await queryInterface.addIndex('feegroups', ['groupname'], {
        name: 'feegroups_groupname_idx'
      });
    }
  },
  async down(queryInterface) {
    await queryInterface.dropTable('feegroups');
  }
};
