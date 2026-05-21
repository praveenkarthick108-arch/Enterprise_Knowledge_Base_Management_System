'use strict';
const { Bookmark, Article, User, Category, Tag } = require('../models');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const { count, rows } = await Bookmark.findAndCountAll({
      where: { user_id: req.user.id },
      include: [{
        model: Article,
        attributes: { exclude: ['content', 'search_vector'] },
        include: [
          { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
          { model: Tag, through: { attributes: [] } }
        ]
      }],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['created_at', 'DESC']],
      distinct: true
    });
    res.json({ success: true, data: { bookmarks: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } } });
  } catch (err) { next(err); }
};

exports.toggle = async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.articleId);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    const existing = await Bookmark.findOne({ where: { article_id: req.params.articleId, user_id: req.user.id } });
    if (existing) {
      await existing.destroy();
      return res.json({ success: true, message: 'Bookmark removed', data: { bookmarked: false } });
    }

    await Bookmark.create({ article_id: req.params.articleId, user_id: req.user.id });
    res.json({ success: true, message: 'Article bookmarked', data: { bookmarked: true } });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await Bookmark.destroy({ where: { article_id: req.params.articleId, user_id: req.user.id } });
    res.json({ success: true, message: 'Bookmark removed' });
  } catch (err) { next(err); }
};
