'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('EtlRunLog', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    run_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    status: { type: DataTypes.STRING(50), defaultValue: 'running' },
    records_extracted: { type: DataTypes.INTEGER, defaultValue: 0 },
    records_transformed: { type: DataTypes.INTEGER, defaultValue: 0 },
    records_loaded: { type: DataTypes.INTEGER, defaultValue: 0 },
    duration_seconds: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    error_message: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'etl_run_logs',
    underscored: true,
    timestamps: true,
  });
};
