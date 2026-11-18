'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('assign_descriptive_remarks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      exam_scheme_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'exam_schemes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      reg_no: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      remark_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'descriptive_remarks', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      sequence: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('assign_descriptive_remarks', {
      fields: ['exam_scheme_id', 'reg_no', 'remark_id'],
      unique: true,
      name: 'uk_assign_descriptive_remarks_scheme_reg_remark',
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('assign_descriptive_remarks');
  },
};
