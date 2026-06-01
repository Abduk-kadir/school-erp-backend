'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class notes extends Model {
    static associate(models) {
      notes.belongsTo(models.batch, {
        foreignKey: 'batch',
        as: 'batchInfo',
      });
      notes.belongsTo(models.class_master, {
        foreignKey: 'class',
        as: 'classInfo',
      });
      notes.belongsTo(models.division_master, {
        foreignKey: 'division',
        as: 'divisionInfo',
      });
      notes.belongsTo(models.Subject, {
        foreignKey: 'subject',
        as: 'subjectInfo',
      });
    }
  }

  notes.init(
    {
      class: DataTypes.INTEGER,
      batch: DataTypes.INTEGER,
      division: DataTypes.INTEGER,
      subject: DataTypes.INTEGER,
      topic: DataTypes.STRING,
      notes_url: DataTypes.STRING,
      chapter: DataTypes.STRING,
      url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'notes',
      tableName: 'notes',
    }
  );

  return notes;
};
