'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('feegroupdetailprices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      groupdetailid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'feegroupdetails',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      feeheadid: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'FeeHeads',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      jan_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      },
      feb_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      },
      mar_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      },
      apr_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      },
      may_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      },
      jun_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      },
      jul_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      },
      aug_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      },
      sep_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      },
      oct_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      },
      nov_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      },
      dec_total: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }, {
      uniqueKeys: {
        feegroupdetailprices_groupdetail_feehead_uidx: {
          fields: ['groupdetailid', 'feeheadid']
        }
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('feegroupdetailprices');
  }
};
