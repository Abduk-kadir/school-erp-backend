'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'studentfeegroupdetailprices';

    try {
      const desc = await queryInterface.describeTable(tableName);
      if (desc.groupdetailid) {
        await queryInterface.removeColumn(tableName, 'groupdetailid');
      }
    } catch (e) {
      // Table might not exist yet; ignore.
    }
  },

  async down(queryInterface, Sequelize) {
    const tableName = 'studentfeegroupdetailprices';

    try {
      const desc = await queryInterface.describeTable(tableName);
      if (!desc.groupdetailid) {
        await queryInterface.addColumn(tableName, 'groupdetailid', {
          type: Sequelize.INTEGER,
          allowNull: true,
        });
      }
    } catch (e) {
      // ignore
    }
  },
};

