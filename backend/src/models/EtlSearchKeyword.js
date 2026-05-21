'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('EtlSearchKeyword', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    keyword: { type: DataTypes.STRING(500), allowNull: false },
    search_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    period_date: { type: DataTypes.DATEONLY },
    etl_run_id: { type: DataTypes.INTEGER },
  }, {
    tableName: 'etl_search_keywords',
    underscored: true,
    timestamps: true,
  });
};
