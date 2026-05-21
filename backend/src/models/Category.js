'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    description: { type: DataTypes.TEXT },
    slug: { type: DataTypes.STRING(120), unique: true },
    icon: { type: DataTypes.STRING(50), defaultValue: 'folder' },
    parent_id: { type: DataTypes.INTEGER, allowNull: true },
    created_by: { type: DataTypes.UUID }
  }, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
