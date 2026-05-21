'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ArticleVersion', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    article_id: { type: DataTypes.UUID, allowNull: false },
    title: { type: DataTypes.STRING(300), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    version_number: { type: DataTypes.INTEGER, allowNull: false },
    saved_by: { type: DataTypes.UUID, allowNull: false }
  }, {
    tableName: 'article_versions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};
