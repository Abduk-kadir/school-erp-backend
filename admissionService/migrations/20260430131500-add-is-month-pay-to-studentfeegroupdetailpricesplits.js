'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'studentfeegroupdetailpricesplits';

    let table;
    try {
      table = await queryInterface.describeTable(tableName);
    } catch (e) {
      // table not created yet
      return;
    }

    const cols = [
      'is_jan_pay',
      'is_feb_pay',
      'is_mar_pay',
      'is_apr_pay',
      'is_may_pay',
      'is_jun_pay',
      'is_jul_pay',
      'is_aug_pay',
      'is_sep_pay',
      'is_oct_pay',
      'is_nov_pay',
      'is_dec_pay',
    ];

    for (const c of cols) {
      if (!table[c]) {
        await queryInterface.addColumn(tableName, c, {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        });
      }
    }
  },

  async down(queryInterface) {
    const tableName = 'studentfeegroupdetailpricesplits';

    let table;
    try {
      table = await queryInterface.describeTable(tableName);
    } catch (e) {
      return;
    }

    const cols = [
      'is_jan_pay',
      'is_feb_pay',
      'is_mar_pay',
      'is_apr_pay',
      'is_may_pay',
      'is_jun_pay',
      'is_jul_pay',
      'is_aug_pay',
      'is_sep_pay',
      'is_oct_pay',
      'is_nov_pay',
      'is_dec_pay',
    ];

    for (const c of cols) {
      if (table[c]) {
        await queryInterface.removeColumn(tableName, c);
      }
    }
  },
};

