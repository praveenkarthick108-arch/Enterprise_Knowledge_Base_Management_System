'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. ETL Run Logs
    await queryInterface.createTable('etl_run_logs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      run_date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      status: { type: Sequelize.STRING(50), allowNull: false, defaultValue: 'running' },
      records_extracted: { type: Sequelize.INTEGER, defaultValue: 0 },
      records_transformed: { type: Sequelize.INTEGER, defaultValue: 0 },
      records_loaded: { type: Sequelize.INTEGER, defaultValue: 0 },
      duration_seconds: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      error_message: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    // 2. ETL Article Analytics
    await queryInterface.createTable('etl_article_analytics', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      article_title: { type: Sequelize.STRING(500), allowNull: false },
      category_name: { type: Sequelize.STRING(200), allowNull: true },
      view_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      avg_rating: { type: Sequelize.DECIMAL(3, 2), defaultValue: 0 },
      comment_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      bookmark_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      engagement_score: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      report_date: { type: Sequelize.DATEONLY, allowNull: true },
      etl_run_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'etl_run_logs', key: 'id' } },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    // 3. ETL Category Trends
    await queryInterface.createTable('etl_category_trends', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      category_name: { type: Sequelize.STRING(200), allowNull: false },
      article_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_views: { type: Sequelize.INTEGER, defaultValue: 0 },
      avg_views_per_article: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
      avg_rating: { type: Sequelize.DECIMAL(3, 2), defaultValue: 0 },
      total_comments: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_bookmarks: { type: Sequelize.INTEGER, defaultValue: 0 },
      period_date: { type: Sequelize.DATEONLY, allowNull: true },
      etl_run_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'etl_run_logs', key: 'id' } },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    // 4. ETL Search Keywords
    await queryInterface.createTable('etl_search_keywords', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      keyword: { type: Sequelize.STRING(500), allowNull: false },
      search_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      period_date: { type: Sequelize.DATEONLY, allowNull: true },
      etl_run_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'etl_run_logs', key: 'id' } },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    // 5. ETL Author Activity
    await queryInterface.createTable('etl_author_activity', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      author_name: { type: Sequelize.STRING(200), allowNull: false },
      total_articles: { type: Sequelize.INTEGER, defaultValue: 0 },
      published_articles: { type: Sequelize.INTEGER, defaultValue: 0 },
      draft_articles: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_views: { type: Sequelize.INTEGER, defaultValue: 0 },
      avg_rating: { type: Sequelize.DECIMAL(3, 2), defaultValue: 0 },
      total_comments: { type: Sequelize.INTEGER, defaultValue: 0 },
      total_bookmarks: { type: Sequelize.INTEGER, defaultValue: 0 },
      period_date: { type: Sequelize.DATEONLY, allowNull: true },
      etl_run_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'etl_run_logs', key: 'id' } },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    // Indexes for common query patterns
    await queryInterface.addIndex('etl_article_analytics', ['engagement_score']);
    await queryInterface.addIndex('etl_article_analytics', ['category_name']);
    await queryInterface.addIndex('etl_category_trends',   ['total_views']);
    await queryInterface.addIndex('etl_search_keywords',   ['search_count']);
    await queryInterface.addIndex('etl_author_activity',   ['total_views']);
    await queryInterface.addIndex('etl_run_logs',          ['run_date']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('etl_author_activity');
    await queryInterface.dropTable('etl_search_keywords');
    await queryInterface.dropTable('etl_category_trends');
    await queryInterface.dropTable('etl_article_analytics');
    await queryInterface.dropTable('etl_run_logs');
  },
};
