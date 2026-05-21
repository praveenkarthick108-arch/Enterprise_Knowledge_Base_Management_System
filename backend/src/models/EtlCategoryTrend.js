'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('EtlCategoryTrend', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    category_name: { type: DataTypes.STRING(200), allowNull: false },
    article_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_views: { type: DataTypes.INTEGER, defaultValue: 0 },
    avg_views_per_article: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    avg_rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    total_comments: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_bookmarks: { type: DataTypes.INTEGER, defaultValue: 0 },
    period_date: { type: DataTypes.DATEONLY },
    etl_run_id: { type: DataTypes.INTEGER },
  }, {
    tableName: 'etl_category_trends',
    underscored: true,
    timestamps: true,
  });
};
