'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('SearchLog', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    query: { type: DataTypes.STRING(500), allowNull: false },
    user_id: { type: DataTypes.UUID },
    results_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    ip_address: { type: DataTypes.STRING(50) }
  }, {
    tableName: 'search_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};
