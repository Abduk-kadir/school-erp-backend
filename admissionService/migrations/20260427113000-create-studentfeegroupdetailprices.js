'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'studentfeegroupdetailprices';
    const indexName = 'studentfeegroupdetailprices_reg_feepricedetail_uidx';

    let tableExists = true;
    try {
      await queryInterface.describeTable(tableName);
    } catch (e) {
      tableExists = false;
    }

    if (!tableExists) {
      await queryInterface.createTable(tableName, {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },

        reg_no: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        feegroupdetailpriceid: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        feeheadid: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },

        jan_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        jan_total_paid: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        jan_total_due: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

        feb_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        feb_total_paid: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        feb_total_due: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

        mar_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        mar_total_paid: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        mar_total_due: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

        apr_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        apr_total_paid: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        apr_total_due: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

        may_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        may_total_paid: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        may_total_due: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

        jun_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        jun_total_paid: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        jun_total_due: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

        jul_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        jul_total_paid: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        jul_total_due: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

        aug_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        aug_total_paid: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        aug_total_due: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

        sep_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        sep_total_paid: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        sep_total_due: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

        oct_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        oct_total_paid: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        oct_total_due: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

        nov_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        nov_total_paid: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        nov_total_due: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

        dec_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        dec_total_paid: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        dec_total_due: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }

    try {
      const indexes = await queryInterface.showIndex(tableName);
      const hasIndex = Array.isArray(indexes) && indexes.some((i) => i && i.name === indexName);
      if (!hasIndex) {
        await queryInterface.addIndex(tableName, ['reg_no', 'feegroupdetailpriceid'], {
          unique: true,
          name: indexName,
        });
      }
    } catch (e) {
      // ignore (table might not exist yet, or index already exists)
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('studentfeegroupdetailprices');
  },
};

