'use strict';
const { Article, User, Category, Tag, SearchLog, ArticleView, Comment, Rating, sequelize } = require('../models');

exports.getDashboard = async (req, res, next) => {
  try {
    const [total, approved, pending, rejected, draft, archived, totalUsers, totalComments] = await Promise.all([
      Article.unscoped().count({ where: { is_deleted: false } }),
      Article.count({ where: { status: 'approved' } }),
      Article.count({ where: { status: 'pending' } }),
      Article.count({ where: { status: 'rejected' } }),
      Article.count({ where: { status: 'draft' } }),
      Article.count({ where: { status: 'archived' } }),
      User.count({ where: { is_active: true } }),
      Comment.count({ where: { is_deleted: false } })
    ]);

    res.json({ success: true, data: { articles: { total, approved, pending, rejected, draft, archived }, users: totalUsers, comments: totalComments } });
  } catch (err) { next(err); }
};

exports.getPopularArticles = async (req, res, next) => {
  try {
    const articles = await Article.findAll({
      where: { status: 'approved' },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] }
      ],
      attributes: ['id', 'title', 'view_count', 'published_at', 'excerpt'],
      order: [['view_count', 'DESC']],
      limit: 10
    });
    res.json({ success: true, data: articles });
  } catch (err) { next(err); }
};

exports.getRecentArticles = async (req, res, next) => {
  try {
    const articles = await Article.findAll({
      where: { status: 'approved' },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Tag, through: { attributes: [] }, attributes: ['id', 'name', 'color'] }
      ],
      attributes: { exclude: ['content', 'search_vector'] },
      order: [['published_at', 'DESC']],
      limit: 10
    });
    res.json({ success: true, data: articles });
  } catch (err) { next(err); }
};

exports.getPopularCategories = async (req, res, next) => {
  try {
    const [results] = await sequelize.query(`
      SELECT c.id, c.name, c.slug, c.icon,
        COUNT(DISTINCT a.id) as article_count,
        COALESCE(SUM(a.view_count), 0) as total_views
      FROM categories c
      LEFT JOIN articles a ON a.category_id = c.id AND a.status = 'approved' AND a.is_deleted = false
      GROUP BY c.id, c.name, c.slug, c.icon
      ORDER BY total_views DESC, article_count DESC
      LIMIT 8
    `);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};

exports.getSearchTrends = async (req, res, next) => {
  try {
    const [results] = await sequelize.query(`
      SELECT query, COUNT(*) as count, MAX(created_at) as last_searched
      FROM search_logs
      WHERE created_at > NOW() - INTERVAL '30 days'
      GROUP BY query
      ORDER BY count DESC
      LIMIT 15
    `);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};

exports.getActiveUsers = async (req, res, next) => {
  try {
    const [results] = await sequelize.query(`
      SELECT u.id, u.name, u.email, u.avatar,
        COUNT(DISTINCT a.id) as articles_count,
        COUNT(DISTINCT c.id) as comments_count,
        COUNT(DISTINCT av.id) as views_count
      FROM users u
      LEFT JOIN articles a ON a.author_id = u.id AND a.status = 'approved'
      LEFT JOIN comments c ON c.user_id = u.id AND c.is_deleted = false AND c.created_at > NOW() - INTERVAL '30 days'
      LEFT JOIN article_views av ON av.user_id = u.id AND av.created_at > NOW() - INTERVAL '30 days'
      WHERE u.is_active = true
      GROUP BY u.id, u.name, u.email, u.avatar
      ORDER BY (COUNT(DISTINCT a.id) + COUNT(DISTINCT c.id)) DESC
      LIMIT 10
    `);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};

exports.getArticleStats = async (req, res, next) => {
  try {
    const [results] = await sequelize.query(`
      SELECT
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as count,
        status
      FROM articles
      WHERE created_at > NOW() - INTERVAL '30 days' AND is_deleted = false
      GROUP BY DATE_TRUNC('day', created_at), status
      ORDER BY date ASC
    `);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};
