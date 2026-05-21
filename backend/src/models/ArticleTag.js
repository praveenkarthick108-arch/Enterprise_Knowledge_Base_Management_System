'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ArticleTag', {
    article_id: { type: DataTypes.UUID, primaryKey: true },
    tag_id: { type: DataTypes.INTEGER, primaryKey: true }
  }, {
    tableName: 'article_tags',
    timestamps: false
  });
};
