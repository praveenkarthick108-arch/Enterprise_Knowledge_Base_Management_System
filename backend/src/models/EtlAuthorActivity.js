'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('EtlAuthorActivity', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    author_name: { type: DataTypes.STRING(200), allowNull: false },
    total_articles: { type: DataTypes.INTEGER, defaultValue: 0 },
    published_articles: { type: DataTypes.INTEGER, defaultValue: 0 },
    draft_articles: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_views: { type: DataTypes.INTEGER, defaultValue: 0 },
    avg_rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    total_comments: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_bookmarks: { type: DataTypes.INTEGER, defaultValue: 0 },
    period_date: { type: DataTypes.DATEONLY },
    etl_run_id: { type: DataTypes.INTEGER },
  }, {
    tableName: 'etl_author_activity',
    underscored: true,
    timestamps: true,
  });
};
