'use strict';
const sanitizeHtml = require('sanitize-html');
const { Article, User, Category, Tag, Attachment, ApprovalHistory, ArticleVersion, ArticleView, Rating, Bookmark, sequelize } = require('../models');
const { Op } = require('sequelize');

const SANITIZE_OPTS = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'pre', 'code', 'mark', 'del', 'ins', 'sup', 'sub']),
  allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, '*': ['class', 'style'], img: ['src', 'alt', 'width', 'height'], a: ['href', 'target', 'rel'] }
};

const articleIncludes = [
  { model: User, as: 'author', attributes: ['id', 'name', 'email', 'avatar', 'department'] },
  { model: User, as: 'reviewer', attributes: ['id', 'name', 'email'] },
  { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'icon'] },
  { model: Tag, through: { attributes: [] }, attributes: ['id', 'name', 'slug', 'color'] },
  { model: Attachment, as: 'attachments', attributes: ['id', 'original_name', 'file_name', 'mime_type', 'file_size', 'created_at'] }
];

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, status, category_id, tag, author_id, sort = 'latest', search } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    const userRole = req.user?.role?.name;

    // Role-based status filtering
    if (status) {
      where.status = status;
    } else if (!['admin', 'reviewer'].includes(userRole)) {
      if (userRole === 'author') {
        where[Op.or] = [{ status: 'approved' }, { author_id: req.user?.id }];
      } else {
        where.status = 'approved';
      }
    }

    if (category_id) where.category_id = category_id;
    if (author_id) where.author_id = author_id;

    const tagFilter = tag ? {
      model: Tag, through: { attributes: [] }, where: { [Op.or]: [{ id: isNaN(tag) ? null : parseInt(tag) }, { slug: tag }] }
    } : { model: Tag, through: { attributes: [] } };

    const order = sort === 'popular' ? [['view_count', 'DESC']] : sort === 'oldest' ? [['created_at', 'ASC']] : [['created_at', 'DESC']];

    const { count, rows } = await Article.findAndCountAll({
      where,
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        tag ? tagFilter : { model: Tag, through: { attributes: [] } },
        { model: Attachment, as: 'attachments', attributes: ['id', 'original_name', 'mime_type'] }
      ],
      attributes: { exclude: ['content', 'search_vector'] },
      limit: parseInt(limit),
      offset,
      order,
      distinct: true
    });

    res.json({ success: true, data: { articles: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) } } });
  } catch (err) { next(err); }
};

exports.getMyArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, status } = req.query;
    const where = { author_id: req.user.id };
    if (status) where.status = status;

    const { count, rows } = await Article.unscoped().findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Tag, through: { attributes: [] } }
      ],
      attributes: { exclude: ['content', 'search_vector'] },
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['updated_at', 'DESC']],
      distinct: true
    });

    res.json({ success: true, data: { articles: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } } });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const article = await Article.unscoped().findByPk(req.params.id, { include: articleIncludes });
    if (!article || article.is_deleted) return res.status(404).json({ success: false, message: 'Article not found' });

    const userRole = req.user?.role?.name;
    if (article.status !== 'approved' && !['admin', 'reviewer'].includes(userRole) && article.author_id !== req.user?.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Track view
    await ArticleView.create({ article_id: article.id, user_id: req.user?.id || null, ip_address: req.ip });
    await Article.increment('view_count', { by: 1, where: { id: article.id } });

    // Get rating and bookmark status for current user
    let userRating = null, isBookmarked = false;
    if (req.user) {
      const rating = await Rating.findOne({ where: { article_id: article.id, user_id: req.user.id } });
      userRating = rating?.score || null;
      const bookmark = await Bookmark.findOne({ where: { article_id: article.id, user_id: req.user.id } });
      isBookmarked = !!bookmark;
    }

    const ratingData = await Rating.findAll({ where: { article_id: article.id }, attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avg'], [sequelize.fn('COUNT', sequelize.col('id')), 'count']] });

    res.json({ success: true, data: { ...article.toJSON(), userRating, isBookmarked, rating: { avg: parseFloat(ratingData[0].dataValues.avg || 0).toFixed(1), count: parseInt(ratingData[0].dataValues.count || 0) } } });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { title, content, excerpt, category_id, tags = [] } = req.body;
    const sanitizedContent = sanitizeHtml(content, SANITIZE_OPTS);
    const autoExcerpt = excerpt || sanitizeHtml(content, { allowedTags: [] }).substring(0, 200) + '...';

    const article = await Article.create({ title, content: sanitizedContent, excerpt: autoExcerpt, category_id: category_id || null, author_id: req.user.id, status: 'draft' });

    if (tags.length > 0) {
      const tagRecords = await Tag.findAll({ where: { id: tags } });
      await article.setTags(tagRecords);
    }

    // Save initial version
    await ArticleVersion.create({ article_id: article.id, title, content: sanitizedContent, version_number: 1, saved_by: req.user.id });

    const full = await Article.findByPk(article.id, { include: articleIncludes });
    res.status(201).json({ success: true, message: 'Article created', data: full });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const article = await Article.unscoped().findByPk(req.params.id);
    if (!article || article.is_deleted) return res.status(404).json({ success: false, message: 'Article not found' });

    const userRole = req.user.role?.name;
    if (article.author_id !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'You can only edit your own articles' });
    }

    if (['approved'].includes(article.status) && userRole !== 'admin') {
      return res.status(400).json({ success: false, message: 'Published articles cannot be edited. Create a new version.' });
    }

    const { title, content, excerpt, category_id, tags = [] } = req.body;
    const sanitizedContent = sanitizeHtml(content, SANITIZE_OPTS);
    const autoExcerpt = excerpt || sanitizeHtml(content, { allowedTags: [] }).substring(0, 200) + '...';

    const versionCount = await ArticleVersion.count({ where: { article_id: article.id } });
    await ArticleVersion.create({ article_id: article.id, title, content: sanitizedContent, version_number: versionCount + 1, saved_by: req.user.id });

    let newStatus = article.status;
    if (['rejected'].includes(article.status)) newStatus = 'draft';

    await article.update({ title, content: sanitizedContent, excerpt: autoExcerpt, category_id: category_id || null, status: newStatus });

    const tagRecords = await Tag.findAll({ where: { id: tags } });
    await article.setTags(tagRecords);

    const full = await Article.findByPk(article.id, { include: articleIncludes });
    res.json({ success: true, message: 'Article updated', data: full });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const article = await Article.unscoped().findByPk(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    const userRole = req.user.role?.name;
    if (article.author_id !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await article.update({ is_deleted: true, status: 'archived' });
    res.json({ success: true, message: 'Article archived' });
  } catch (err) { next(err); }
};

exports.submit = async (req, res, next) => {
  try {
    const article = await Article.unscoped().findByPk(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    if (article.author_id !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });
    if (!['draft', 'rejected'].includes(article.status)) {
      return res.status(400).json({ success: false, message: `Cannot submit article with status: ${article.status}` });
    }

    await article.update({ status: 'pending' });
    await ApprovalHistory.create({ article_id: article.id, reviewer_id: req.user.id, action: 'submitted', comment: req.body.comment || 'Submitted for review' });

    res.json({ success: true, message: 'Article submitted for approval' });
  } catch (err) { next(err); }
};

exports.publish = async (req, res, next) => {
  try {
    const article = await Article.unscoped().findByPk(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    await article.update({ status: 'approved', published_at: new Date(), reviewer_id: req.user.id, reviewed_at: new Date() });
    res.json({ success: true, message: 'Article published' });
  } catch (err) { next(err); }
};

exports.archive = async (req, res, next) => {
  try {
    const article = await Article.unscoped().findByPk(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    await article.update({ status: 'archived' });
    res.json({ success: true, message: 'Article archived' });
  } catch (err) { next(err); }
};

exports.getVersions = async (req, res, next) => {
  try {
    const versions = await ArticleVersion.findAll({
      where: { article_id: req.params.id },
      include: [{ model: User, as: 'savedBy', attributes: ['id', 'name'] }],
      order: [['version_number', 'DESC']]
    });
    res.json({ success: true, data: versions });
  } catch (err) { next(err); }
};
