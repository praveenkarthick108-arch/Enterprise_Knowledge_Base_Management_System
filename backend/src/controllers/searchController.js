'use strict';
const { Article, User, Category, Tag, SearchLog, sequelize } = require('../models');
const { Op } = require('sequelize');

exports.search = async (req, res, next) => {
  try {
    const { q, category_id, tag, author_id, sort = 'relevance', page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }

    const cleanQuery = q.trim().replace(/[^a-zA-Z0-9\s]/g, '');
    const where = { status: 'approved', is_deleted: false };
    if (category_id) where.category_id = category_id;
    if (author_id) where.author_id = author_id;

    let tagWhere = {};
    if (tag) tagWhere = { [Op.or]: [{ id: isNaN(tag) ? 0 : parseInt(tag) }, { slug: tag }] };

    const orderClause = sort === 'popular'
      ? [['view_count', 'DESC']]
      : sort === 'latest'
        ? [['published_at', 'DESC']]
        : [[sequelize.literal(`ts_rank(search_vector, plainto_tsquery('english', ${sequelize.escape(cleanQuery)}))`), 'DESC']];

    const { count, rows } = await Article.unscoped().findAndCountAll({
      where: {
        ...where,
        [Op.or]: [
          sequelize.where(sequelize.fn('plainto_tsquery', 'english', cleanQuery), Op.ne, null),
          { title: { [Op.iLike]: `%${q}%` } },
          { excerpt: { [Op.iLike]: `%${q}%` } }
        ],
        search_vector: sequelize.where(
          sequelize.col('search_vector'),
          Op.ne,
          null
        )
      },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        tag ? { model: Tag, through: { attributes: [] }, where: tagWhere } : { model: Tag, through: { attributes: [] } }
      ],
      attributes: { exclude: ['content', 'search_vector'] },
      limit: parseInt(limit),
      offset,
      order: orderClause,
      distinct: true
    });

    // Log search
    await SearchLog.create({ query: q.trim(), user_id: req.user?.id || null, results_count: count, ip_address: req.ip });

    res.json({ success: true, data: { articles: rows, query: q, pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) } } });
  } catch (err) { next(err); }
};

exports.suggestions = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) return res.json({ success: true, data: [] });

    const articles = await Article.unscoped().findAll({
      where: { status: 'approved', is_deleted: false, title: { [Op.iLike]: `${q}%` } },
      attributes: ['id', 'title'],
      limit: 5,
      order: [['view_count', 'DESC']]
    });

    const tags = await Tag.findAll({
      where: { name: { [Op.iLike]: `${q}%` } },
      attributes: ['id', 'name', 'slug'],
      limit: 3
    });

    res.json({ success: true, data: { articles: articles.map(a => ({ id: a.id, title: a.title, type: 'article' })), tags: tags.map(t => ({ id: t.id, name: t.name, slug: t.slug, type: 'tag' })) } });
  } catch (err) { next(err); }
};

exports.trending = async (req, res, next) => {
  try {
    const [results] = await sequelize.query(`
      SELECT query, COUNT(*) as search_count
      FROM search_logs
      WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY query
      ORDER BY search_count DESC
      LIMIT 10
    `);
    res.json({ success: true, data: results });
  } catch (err) { next(err); }
};
