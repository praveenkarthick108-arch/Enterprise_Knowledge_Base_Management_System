'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('EtlArticleAnalytic', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    article_title: { type: DataTypes.STRING(500), allowNull: false },
    category_name: { type: DataTypes.STRING(200) },
    view_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    avg_rating: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0 },
    comment_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    bookmark_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    engagement_score: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    report_date: { type: DataTypes.DATEONLY },
    etl_run_id: { type: DataTypes.INTEGER },
  }, {
    tableName: 'etl_article_analytics',
    underscored: true,
    timestamps: true,
  });
};
