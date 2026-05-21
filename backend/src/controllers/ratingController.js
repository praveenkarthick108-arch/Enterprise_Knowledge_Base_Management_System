'use strict';
const { Rating, Article, sequelize } = require('../models');

exports.rate = async (req, res, next) => {
  try {
    const { score } = req.body;
    if (!score || score < 1 || score > 5) return res.status(400).json({ success: false, message: 'Score must be between 1 and 5' });

    const article = await Article.findByPk(req.params.articleId);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    const [rating, created] = await Rating.findOrCreate({
      where: { article_id: req.params.articleId, user_id: req.user.id },
      defaults: { score }
    });

    if (!created) await rating.update({ score });

    const stats = await Rating.findAll({
      where: { article_id: req.params.articleId },
      attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avg'], [sequelize.fn('COUNT', sequelize.col('id')), 'count']]
    });

    res.json({ success: true, message: created ? 'Rating submitted' : 'Rating updated', data: { userRating: score, avg: parseFloat(stats[0].dataValues.avg || 0).toFixed(1), count: parseInt(stats[0].dataValues.count || 0) } });
  } catch (err) { next(err); }
};

exports.getSummary = async (req, res, next) => {
  try {
    const stats = await Rating.findAll({
      where: { article_id: req.params.articleId },
      attributes: [[sequelize.fn('AVG', sequelize.col('score')), 'avg'], [sequelize.fn('COUNT', sequelize.col('id')), 'count']]
    });

    let userRating = null;
    if (req.user) {
      const r = await Rating.findOne({ where: { article_id: req.params.articleId, user_id: req.user.id } });
      userRating = r?.score || null;
    }

    res.json({ success: true, data: { avg: parseFloat(stats[0].dataValues.avg || 0).toFixed(1), count: parseInt(stats[0].dataValues.count || 0), userRating } });
  } catch (err) { next(err); }
};
