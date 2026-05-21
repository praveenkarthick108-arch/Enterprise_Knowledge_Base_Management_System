'use strict';
const { Comment, User, Article } = require('../models');

exports.getByArticle = async (req, res, next) => {
  try {
    const comments = await Comment.findAll({
      where: { article_id: req.params.articleId, parent_id: null, is_deleted: false },
      include: [
        { model: User, as: 'author', attributes: ['id', 'name', 'avatar'] },
        { model: Comment, as: 'replies', where: { is_deleted: false }, required: false, include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar'] }], order: [['created_at', 'ASC']] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json({ success: true, data: comments });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.articleId);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    const { content, parent_id } = req.body;
    const comment = await Comment.create({ article_id: req.params.articleId, user_id: req.user.id, content, parent_id: parent_id || null });

    const full = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar'] }]
    });

    res.status(201).json({ success: true, message: 'Comment added', data: full });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment || comment.is_deleted) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.user_id !== req.user.id) return res.status(403).json({ success: false, message: 'You can only edit your own comments' });

    await comment.update({ content: req.body.content });
    res.json({ success: true, message: 'Comment updated', data: comment });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const userRole = req.user.role?.name;
    if (comment.user_id !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    await comment.update({ is_deleted: true, content: '[deleted]' });
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) { next(err); }
};
