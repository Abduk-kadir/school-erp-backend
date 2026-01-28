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
      name: 'fk_documentrequirements_documenttype',
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
      name: 'fk_documentrequirements_category',
      references: {
        table: 'categories',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Unique constraint (you already had this – good!)
    await queryInterface.addConstraint('DocumentRequirements', {
      fields: ['document_type_id', 'class_id', 'category_id'],
      type: 'unique',
      name: 'unique_document_rule',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order
    await queryInterface.removeConstraint('DocumentRequirements', 'fk_documentrequirements_documenttype');
    await queryInterface.removeConstraint('DocumentRequirements', 'fk_documentrequirements_class');
    await queryInterface.removeConstraint('DocumentRequirements', 'fk_documentrequirements_category');
    await queryInterface.removeConstraint('DocumentRequirements', 'unique_document_rule');
    await queryInterface.dropTable('DocumentRequirements');
  }
};