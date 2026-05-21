'use strict';
const { Article, User, Category, Tag, ApprovalHistory, sequelize } = require('../models');

const articleIncludes = [
  { model: User, as: 'author', attributes: ['id', 'name', 'email', 'avatar'] },
  { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
  { model: Tag, through: { attributes: [] } }
];

exports.getQueue = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const { count, rows } = await Article.findAndCountAll({
      where: { status: 'pending' },
      include: articleIncludes,
      attributes: { exclude: ['content', 'search_vector'] },
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['created_at', 'ASC']],
      distinct: true
    });
    res.json({ success: true, data: { articles: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } } });
  } catch (err) { next(err); }
};

exports.approve = async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.articleId);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    if (article.status !== 'pending') return res.status(400).json({ success: false, message: 'Article is not pending approval' });

    await article.update({ status: 'approved', reviewer_id: req.user.id, reviewed_at: new Date(), published_at: new Date() });
    await ApprovalHistory.create({ article_id: article.id, reviewer_id: req.user.id, action: 'approved', comment: req.body.comment || 'Approved' });

    res.json({ success: true, message: 'Article approved and published' });
  } catch (err) { next(err); }
};

exports.reject = async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.articleId);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    if (article.status !== 'pending') return res.status(400).json({ success: false, message: 'Article is not pending approval' });

    const { comment } = req.body;
    if (!comment) return res.status(400).json({ success: false, message: 'Rejection reason is required' });

    await article.update({ status: 'rejected', reviewer_id: req.user.id, reviewed_at: new Date(), rejection_reason: comment });
    await ApprovalHistory.create({ article_id: article.id, reviewer_id: req.user.id, action: 'rejected', comment });

    res.json({ success: true, message: 'Article rejected' });
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const history = await ApprovalHistory.findAll({
      where: { article_id: req.params.articleId },
      include: [{ model: User, as: 'reviewer', attributes: ['id', 'name', 'avatar'] }],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: history });
  } catch (err) { next(err); }
};
