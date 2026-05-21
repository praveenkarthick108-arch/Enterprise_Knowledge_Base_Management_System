'use strict';
const { Tag, Article, sequelize } = require('../models');
const { Op } = require('sequelize');

const slugify = (text) => text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

exports.getAll = async (req, res, next) => {
  try {
    const tags = await Tag.findAll({
      order: [['name', 'ASC']],
      attributes: {
        include: [
          [sequelize.literal('(SELECT COUNT(*) FROM article_tags WHERE article_tags.tag_id = "Tag".id)'), 'usage_count']
        ]
      }
    });
    res.json({ success: true, data: tags });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, color } = req.body;
    let slug = slugify(name);
    const existing = await Tag.findOne({ where: { [Op.or]: [{ name }, { slug }] } });
    if (existing) return res.status(409).json({ success: false, message: 'Tag already exists' });

    const tag = await Tag.create({ name, slug, color });
    res.status(201).json({ success: true, message: 'Tag created', data: tag });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ success: false, message: 'Tag not found' });
    const { name, color } = req.body;
    let slug = tag.slug;
    if (name !== tag.name) slug = slugify(name);
    await tag.update({ name, slug, color });
    res.json({ success: true, message: 'Tag updated', data: tag });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ success: false, message: 'Tag not found' });
    await tag.destroy();
    res.json({ success: true, message: 'Tag deleted' });
  } catch (err) { next(err); }
};
