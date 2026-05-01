'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'studentfeegroupdetailpricesplits';

    let table;
    try {
      table = await queryInterface.describeTable(tableName);
    } catch (e) {
      return;
    }

    const pairs = [
      ['is_jan_pay', 'jan_total'],
      ['is_feb_pay', 'feb_total'],
      ['is_mar_pay', 'mar_total'],
      ['is_apr_pay', 'apr_total'],
      ['is_may_pay', 'may_total'],
      ['is_jun_pay', 'jun_total'],
      ['is_jul_pay', 'jul_total'],
      ['is_aug_pay', 'aug_total'],
      ['is_sep_pay', 'sep_total'],
      ['is_oct_pay', 'oct_total'],
      ['is_nov_pay', 'nov_total'],
      ['is_dec_pay', 'dec_total'],
    ];

    for (const [flagCol, afterCol] of pairs) {
      if (!table[flagCol] || !table[afterCol]) continue;

      // MySQL supports column ordering with `AFTER`. Sequelize passes it through.
      await queryInterface.changeColumn(tableName, flagCol, {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        after: afterCol,
      });
    }
  },

  async down() {
    // no-op (column order only)
  },
};

