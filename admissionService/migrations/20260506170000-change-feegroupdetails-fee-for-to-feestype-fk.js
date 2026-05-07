'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('feegroupdetails');
    if (!table.fee_for) return;

    // If old data has non-numeric strings, MySQL can coerce to 0.
    // Make them NULL before converting type.
    await queryInterface.sequelize.query(`
      UPDATE feegroupdetails
      SET fee_for = NULL
      WHERE fee_for IS NOT NULL
        AND fee_for NOT REGEXP '^[0-9]+$'
    `);

    await queryInterface.changeColumn('feegroupdetails', 'fee_for', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    const constraints = await queryInterface.showConstraint('feegroupdetails');
    const hasFk = constraints.some(
      (c) =>
        c.constraintName === 'feegroupdetails_fee_for_feestypes_fk' ||
        (c.columnNames?.includes('fee_for') &&
          (c.referencedTableName === 'FeesTypes' || c.referencedTableName === 'feestypes'))
    );

    if (!hasFk) {
      await queryInterface.addConstraint('feegroupdetails', {
        fields: ['fee_for'],
        type: 'foreign key',
        name: 'feegroupdetails_fee_for_feestypes_fk',
        references: {
          table: 'FeesTypes',
          field: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('feegroupdetails');
    if (!table.fee_for) return;

    const constraints = await queryInterface.showConstraint('feegroupdetails');
    const fk = constraints.find(
      (c) => c.constraintName === 'feegroupdetails_fee_for_feestypes_fk'
    );
    if (fk) {
      await queryInterface.removeConstraint(
        'feegroupdetails',
        'feegroupdetails_fee_for_feestypes_fk'
      );
    }

    await queryInterface.changeColumn('feegroupdetails', 'fee_for', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};

