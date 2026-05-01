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

    const d = () => ({ type: Sequelize.DECIMAL(12, 2), allowNull: true });

    const months = [
      { total: 'jan_total', split1: 'jan_split1', split2: 'jan_split2', flag: 'is_jan_pay' },
      { total: 'feb_total', split1: 'feb_split1', split2: 'feb_split2', flag: 'is_feb_pay' },
      { total: 'mar_total', split1: 'mar_split1', split2: 'mar_split2', flag: 'is_mar_pay' },
      { total: 'apr_total', split1: 'apr_split1', split2: 'apr_split2', flag: 'is_apr_pay' },
      { total: 'may_total', split1: 'may_split1', split2: 'may_split2', flag: 'is_may_pay' },
      { total: 'jun_total', split1: 'jun_split1', split2: 'jun_split2', flag: 'is_jun_pay' },
      { total: 'jul_total', split1: 'jul_split1', split2: 'jul_split2', flag: 'is_jul_pay' },
      { total: 'aug_total', split1: 'aug_split1', split2: 'aug_split2', flag: 'is_aug_pay' },
      { total: 'sep_total', split1: 'sep_split1', split2: 'sep_split2', flag: 'is_sep_pay' },
      { total: 'oct_total', split1: 'oct_split1', split2: 'oct_split2', flag: 'is_oct_pay' },
      { total: 'nov_total', split1: 'nov_split1', split2: 'nov_split2', flag: 'is_nov_pay' },
      { total: 'dec_total', split1: 'dec_split1', split2: 'dec_split2', flag: 'is_dec_pay' },
    ];

    for (const { total, split1, split2, flag } of months) {
      if (!table[split1]) {
        await queryInterface.addColumn(tableName, split1, { ...d(), after: total });
      }
      if (!table[split2]) {
        await queryInterface.addColumn(tableName, split2, { ...d(), after: split1 });
      }

      if (table[flag]) {
        await queryInterface.changeColumn(tableName, flag, {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
          after: split2,
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
      'jan_split1',
      'jan_split2',
      'feb_split1',
      'feb_split2',
      'mar_split1',
      'mar_split2',
      'apr_split1',
      'apr_split2',
      'may_split1',
      'may_split2',
      'jun_split1',
      'jun_split2',
      'jul_split1',
      'jul_split2',
      'aug_split1',
      'aug_split2',
      'sep_split1',
      'sep_split2',
      'oct_split1',
      'oct_split2',
      'nov_split1',
      'nov_split2',
      'dec_split1',
      'dec_split2',
    ];

    for (const c of cols) {
      if (table[c]) {
        await queryInterface.removeColumn(tableName, c);
      }
    }
  },
};

