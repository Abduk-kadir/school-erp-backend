'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('document_requirements', {
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
    await queryInterface.addConstraint('document_requirements', {
      fields: ['document_type_id'],
      type: 'foreign key',
      name: 'fk_documentrequirements_documenttype_v5',
      references: {
        table: 'document_types',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('document_requirements', {
      fields: ['class_id'],
      type: 'foreign key',
      name: 'fk_documentrequirements_class_v5',
      
      references: {
        table: 'class_masters',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    await queryInterface.addConstraint('document_requirements', {
      fields: ['category_id'],
      type: 'foreign key',
      name: 'fk_documentrequirements_category_v5',
      references: {
        table: 'Categories',
        field: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });

    // Unique constraint (you already had this – good!)
    await queryInterface.addConstraint('document_requirements', {
      fields: ['document_type_id', 'class_id', 'category_id'],
      type: 'unique',
      name: 'unique_document_rule5',
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop in reverse order
    await queryInterface.removeConstraint('document_requirements', 'fk_documentrequirements_documenttype_v5');
    await queryInterface.removeConstraint('document_requirements', 'fk_documentrequirements_class_v5');
    await queryInterface.removeConstraint('document_requirements', 'fk_documentrequirements_category_v5');
    await queryInterface.removeConstraint('document_requirements', 'unique_document_rule5');
    await queryInterface.dropTable('document_requirements');
  }
};