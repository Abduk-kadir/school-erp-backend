'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const table = await queryInterface.describeTable('feegroupdetailprices');
    const pairs = [
      ['jantotal', 'jan_total'],
      ['febtotal', 'feb_total'],
      ['marchtotal', 'mar_total'],
      ['apriltotal', 'apr_total'],
      ['maytotal', 'may_total'],
      ['juntotal', 'jun_total'],
      ['jultotal', 'jul_total'],
      ['augtotal', 'aug_total'],
      ['septotal', 'sep_total'],
      ['octtotal', 'oct_total'],
      ['novtotal', 'nov_total'],
      ['dectotal', 'dec_total']
    ];
    for (const [from, to] of pairs) {
      if (table[from] && !table[to]) {
        await queryInterface.renameColumn('feegroupdetailprices', from, to);
      }
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('feegroupdetailprices');
    const pairs = [
      ['jan_total', 'jantotal'],
      ['feb_total', 'febtotal'],
      ['mar_total', 'marchtotal'],
      ['apr_total', 'apriltotal'],
      ['may_total', 'maytotal'],
      ['jun_total', 'juntotal'],
      ['jul_total', 'jultotal'],
      ['aug_total', 'augtotal'],
      ['sep_total', 'septotal'],
      ['oct_total', 'octtotal'],
      ['nov_total', 'novtotal'],
      ['dec_total', 'dectotal']
    ];
    for (const [from, to] of pairs) {
      if (table[from] && !table[to]) {
        await queryInterface.renameColumn('feegroupdetailprices', from, to);
      }
    }
  }
};
