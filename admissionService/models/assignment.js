'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class assignment extends Model {
    static associate(models) {
      assignment.belongsTo(models.batch, {
        foreignKey: 'batch',
        as: 'batchInfo',
      });
      assignment.belongsTo(models.class_master, {
        foreignKey: 'class',
        as: 'classInfo',
      });
      assignment.belongsTo(models.division_master, {
        foreignKey: 'division',
        as: 'divisionInfo',
      });
      assignment.belongsTo(models.Subject, {
        foreignKey: 'subject',
        as: 'subjectInfo',
      });
    }
  }

  assignment.init(
    {
      class: DataTypes.INTEGER,
      batch: DataTypes.INTEGER,
      division: DataTypes.INTEGER,
      subject: DataTypes.INTEGER,
      submission_date: DataTypes.DATEONLY,
      submission_time: DataTypes.TIME,
      title: DataTypes.STRING,
      assignment_url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'assignment',
      tableName: 'assignments',
    }
  );

  return assignment;
};
