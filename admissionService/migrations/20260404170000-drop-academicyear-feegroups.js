'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('feegroups');
    if (!table.academicyear) return;

    try {
      await queryInterface.removeIndex(
        'feegroups',
        'feegroups_groupname_academicyear_idx'
      );
    } catch (_e) {
      /* */
    }
    try {
      await queryInterface.removeIndex(
        'feegroups',
        'feegroups_groupname_academic_year_uidx'
      );
    } catch (_e) {
      /* */
    }

    await queryInterface.removeColumn('feegroups', 'academicyear');

    try {
      await queryInterface.addIndex('feegroups', ['groupname'], {
        name: 'feegroups_groupname_idx'
      });
    } catch (_e) {
      /* already exists */
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('feegroups');
    if (table.academicyear) return;

    try {
      await queryInterface.removeIndex('feegroups', 'feegroups_groupname_idx');
    } catch (_e) {
      /* */
    }

    await queryInterface.addColumn('feegroups', 'academicyear', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.changeColumn('feegroups', 'academicyear', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });

    await queryInterface.addIndex('feegroups', ['groupname', 'academicyear'], {
      name: 'feegroups_groupname_academicyear_idx'
    });
  }
};
