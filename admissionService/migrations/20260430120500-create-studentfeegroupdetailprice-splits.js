'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableName = 'studentfeegroupdetailpricesplits';
    const parentTable = 'studentfeegroupdetailprices';
    const fkName = 'studentfeegroupdetailpricesplits_student_installment_id_fk';
    const uniqueIndexName = 'studentfeegroupdetailpricesplits_student_installment_uidx';

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

        student_installment_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: parentTable,
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },

        jan_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        feb_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        mar_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        apr_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        may_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        jun_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        jul_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        aug_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        sep_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        oct_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        nov_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
        dec_total: { type: Sequelize.DECIMAL(12, 2), allowNull: true },

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

    // Ensure FK + unique index (safe if already exists)
    try {
      const indexes = await queryInterface.showIndex(tableName);
      const hasUnique = Array.isArray(indexes) && indexes.some((i) => i && i.name === uniqueIndexName);
      if (!hasUnique) {
        await queryInterface.addIndex(tableName, ['student_installment_id'], {
          unique: true,
          name: uniqueIndexName,
        });
      }
    } catch (e) {
      // ignore
    }

    // Some dialects ignore/rename inline FK names; try to add constraint explicitly too.
    try {
      await queryInterface.addConstraint(tableName, {
        fields: ['student_installment_id'],
        type: 'foreign key',
        name: fkName,
        references: {
          table: parentTable,
          field: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    } catch (e) {
      // ignore (might already exist due to inline FK)
    }
  },

  async down(queryInterface) {
    await queryInterface.dropTable('studentfeegroupdetailpricesplits');
  },
};

