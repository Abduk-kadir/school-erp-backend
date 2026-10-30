'use strict';

const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class result_mark_entry_list extends Model {
    static associate(models) {
      result_mark_entry_list.belongsTo(models.exam_scheme, {
        foreignKey: 'exam_scheme_id',
        as: 'scheme',
      });
      result_mark_entry_list.belongsTo(models.division_master, {
        foreignKey: 'division_id',
        as: 'divisionInfo',
      });
      result_mark_entry_list.belongsTo(models.Subject, {
        foreignKey: 'subject_id',
        as: 'subjectInfo',
      });
      result_mark_entry_list.hasMany(models.student_mark, {
        foreignKey: 'result_mark_entry_list_id',
        as: 'marks',
      });
    }
  }

  result_mark_entry_list.init(
    {
      exam_scheme_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      division_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      searchbystudent: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'result_mark_entry_list',
      tableName: 'result_mark_entry_lists',
    }
  );

  return result_mark_entry_list;
};
