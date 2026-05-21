'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ArticleView', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    article_id: { type: DataTypes.UUID, allowNull: false },
    user_id: { type: DataTypes.UUID },
    ip_address: { type: DataTypes.STRING(50) }
  }, {
    tableName: 'article_views',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};
