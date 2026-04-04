'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('feegroups');

    if (table.academic_year_id) {
      if (!table.academicyear) {
        await queryInterface.addColumn('feegroups', 'academicyear', {
          type: Sequelize.STRING,
          allowNull: true
        });
      }

      try {
        await queryInterface.sequelize.query(`
          UPDATE feegroups f
          INNER JOIN \`Academic_Years\` ay ON f.academic_year_id = ay.id
          SET f.academicyear = ay.academic_year
          WHERE f.academicyear IS NULL OR TRIM(f.academicyear) = ''
        `);
      } catch (_e) {
        /* Academic_Years missing */
      }

      await queryInterface.sequelize.query(`
        UPDATE feegroups
        SET academicyear = CONCAT('year-', academic_year_id)
        WHERE academicyear IS NULL OR TRIM(IFNULL(academicyear, '')) = ''
      `);

      try {
        await queryInterface.removeIndex(
          'feegroups',
          'feegroups_groupname_academic_year_uidx'
        );
      } catch (_e) {
        /* */
      }

      await queryInterface.removeColumn('feegroups', 'academic_year_id');

      await queryInterface.changeColumn('feegroups', 'academicyear', {
        type: Sequelize.STRING,
        allowNull: false
      });

      try {
        await queryInterface.addIndex('feegroups', ['groupname', 'academicyear'], {
          name: 'feegroups_groupname_academicyear_idx'
        });
      } catch (_e) {
        /* */
      }
    }

    // Academic_Years table is kept: other tables (e.g. students) may reference it.
  },

  async down() {
    throw new Error(
      '20260404160000-remove-academic-year-feegroup-string cannot be reverted automatically'
    );
  }
};
