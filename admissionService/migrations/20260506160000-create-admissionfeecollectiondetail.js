'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    let tableExists = true;
    try {
      await queryInterface.describeTable('admissionfeecollectiondetails');
    } catch (e) {
      tableExists = false;
    }

    if (!tableExists) {
      await queryInterface.createTable('admissionfeecollectiondetails', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        reg_no: {
          type: Sequelize.BIGINT,
        },
        feeheadid: {
          type: Sequelize.INTEGER,
        },
        fee_table_id: {
          type: Sequelize.INTEGER,
          references: {
            model: 'admissionfeecollections',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        date: {
          type: Sequelize.DATE,
        },
        jan_total: { type: Sequelize.DECIMAL },
        jan_paid: { type: Sequelize.DECIMAL },
        jan_total_paid: { type: Sequelize.DECIMAL },
        jan_total_due: { type: Sequelize.DECIMAL },
        feb_total: { type: Sequelize.DECIMAL },
        feb_paid: { type: Sequelize.DECIMAL },
        feb_total_paid: { type: Sequelize.DECIMAL },
        feb_total_due: { type: Sequelize.DECIMAL },
        mar_total: { type: Sequelize.DECIMAL },
        mar_paid: { type: Sequelize.DECIMAL },
        mar_total_paid: { type: Sequelize.DECIMAL },
        mar_total_due: { type: Sequelize.DECIMAL },
        apr_total: { type: Sequelize.DECIMAL },
        apr_paid: { type: Sequelize.DECIMAL },
        apr_total_paid: { type: Sequelize.DECIMAL },
        apr_total_due: { type: Sequelize.DECIMAL },
        may_total: { type: Sequelize.DECIMAL },
        may_paid: { type: Sequelize.DECIMAL },
        may_total_paid: { type: Sequelize.DECIMAL },
        may_total_due: { type: Sequelize.DECIMAL },
        jun_total: { type: Sequelize.DECIMAL },
        jun_paid: { type: Sequelize.DECIMAL },
        jun_total_paid: { type: Sequelize.DECIMAL },
        jun_total_due: { type: Sequelize.DECIMAL },
        jul_total: { type: Sequelize.DECIMAL },
        jul_paid: { type: Sequelize.DECIMAL },
        jul_total_paid: { type: Sequelize.DECIMAL },
        jul_total_due: { type: Sequelize.DECIMAL },
        aug_total: { type: Sequelize.DECIMAL },
        aug_paid: { type: Sequelize.DECIMAL },
        aug_total_paid: { type: Sequelize.DECIMAL },
        aug_total_due: { type: Sequelize.DECIMAL },
        sep_total: { type: Sequelize.DECIMAL },
        sep_paid: { type: Sequelize.DECIMAL },
        sep_total_paid: { type: Sequelize.DECIMAL },
        sep_total_due: { type: Sequelize.DECIMAL },
        oct_total: { type: Sequelize.DECIMAL },
        oct_paid: { type: Sequelize.DECIMAL },
        oct_total_paid: { type: Sequelize.DECIMAL },
        oct_total_due: { type: Sequelize.DECIMAL },
        nov_total: { type: Sequelize.DECIMAL },
        nov_paid: { type: Sequelize.DECIMAL },
        nov_total_paid: { type: Sequelize.DECIMAL },
        nov_total_due: { type: Sequelize.DECIMAL },
        dec_total: { type: Sequelize.DECIMAL },
        dec_paid: { type: Sequelize.DECIMAL },
        dec_total_paid: { type: Sequelize.DECIMAL },
        dec_total_due: { type: Sequelize.DECIMAL },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
    }

    const indexes = await queryInterface.showIndex('admissionfeecollectiondetails');
    const hasFeeTableIdIndex = indexes.some(
      (idx) =>
        idx.name === 'admissionfeecollectiondetails_fee_table_id_idx' ||
        (Array.isArray(idx.fields) &&
          idx.fields.length === 1 &&
          idx.fields[0]?.attribute === 'fee_table_id')
    );

    if (!hasFeeTableIdIndex) {
      await queryInterface.addIndex('admissionfeecollectiondetails', ['fee_table_id'], {
        name: 'admissionfeecollectiondetails_fee_table_id_idx',
      });
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('admissionfeecollectiondetails');
  },
};

