'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('institutes', 'name', {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true,           // optional but recommended
    });

  
  },

  async down(queryInterface, Sequelize) {
    // Revert back to INTEGER if needed (for rollback)
    await queryInterface.changeColumn('institutes', 'name', {
      type: Sequelize.INTEGER,
    });

    await queryInterface.changeColumn('institutes', 'code', {
      type: Sequelize.INTEGER,
    });
  }
};