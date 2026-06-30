'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DocumentRequirements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      document_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      class_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      condition_attribute:{
        type:Sequelize.STRING,
        allowNull: true,
      },
      condition_value:{
        type:Sequelize.STRING
      },
      is_mandatory: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      academic_year: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // ── Add real foreign key constraints ────────────────────────────────
    await queryInterface.addConstraint('DocumentRequirements', {
      fields: ['document_type_id'],
      type: 'foreign key',
      name: 'fk_documentrequirements_document_type_id',
      references: {
        table: 'document_types',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('DocumentRequirements', {
      fields: ['class_id'],
      type: 'foreign key',
      name: 'fk_documentrequirements_class_id',
      references: {
        table: 'class_masters',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('DocumentRequirements', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'fk_documentrequirements_category_id',
      references: {
        table: 'categories',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Unique constraint ensures one rule per document/class/category combination.
    await queryInterface.addConstraint('DocumentRequirements', {
      fields: ['document_type_id', 'class_id', 'category_id'],
      type: 'unique',
      name: 'unique_documentrequirements_document_type_class_category',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order
    await queryInterface.removeConstraint('DocumentRequirements', 'fk_documentrequirements_document_type_id');
    await queryInterface.removeConstraint('DocumentRequirements', 'fk_documentrequirements_class_id');
    await queryInterface.removeConstraint('DocumentRequirements', 'fk_documentrequirements_category_id');
    await queryInterface.removeConstraint('DocumentRequirements', 'unique_documentrequirements_document_type_class_category');
    await queryInterface.dropTable('DocumentRequirements');
  }
};