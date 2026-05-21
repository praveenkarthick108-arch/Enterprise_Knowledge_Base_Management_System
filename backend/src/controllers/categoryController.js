'use strict';
const { Category, Article, sequelize } = require('../models');
const { Op } = require('sequelize');

const slugify = (text) => text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

const buildTree = (cats, parentId = null) =>
  cats.filter(c => c.parent_id === parentId).map(c => ({ ...c.toJSON(), children: buildTree(cats, c.id) }));

exports.getAll = async (req, res, next) => {
  try {
    const { flat } = req.query;
    const categories = await Category.findAll({
      include: [{ model: Category, as: 'children', separate: true, order: [['name', 'ASC']] }],
      order: [['name', 'ASC']]
    });

    const rootCats = categories.filter(c => !c.parent_id);
    const data = flat === 'true' ? categories : buildTree(categories);

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, description, parent_id, icon } = req.body;
    let slug = slugify(name);
    const existing = await Category.findOne({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const cat = await Category.create({ name, description, slug, parent_id: parent_id || null, icon, created_by: req.user.id });
    res.status(201).json({ success: true, message: 'Category created', data: cat });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

    const { name, description, parent_id, icon } = req.body;
    if (parent_id && parseInt(parent_id) === cat.id) {
      return res.status(400).json({ success: false, message: 'Category cannot be its own parent' });
    }

    let slug = cat.slug;
    if (name !== cat.name) {
      slug = slugify(name);
      const existing = await Category.findOne({ where: { slug, id: { [Op.ne]: cat.id } } });
      if (existing) slug = `${slug}-${Date.now()}`;
    }

    await cat.update({ name, description, slug, parent_id: parent_id || null, icon });
    res.json({ success: true, message: 'Category updated', data: cat });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

    const articleCount = await Article.count({ where: { category_id: cat.id } });
    if (articleCount > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete: ${articleCount} article(s) use this category` });
    }

    await Category.update({ parent_id: null }, { where: { parent_id: cat.id } });
    await cat.destroy();

    res.json({ success: true, message: 'Category deleted' });
  } catch (err) { next(err); }
};

exports.getArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });

    const { count, rows } = await Article.findAndCountAll({
      where: { category_id: cat.id, status: 'approved' },
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['published_at', 'DESC']]
    });

    res.json({ success: true, data: { category: cat, articles: rows, pagination: { total: count, page: parseInt(page), pages: Math.ceil(count / limit) } } });
  } catch (err) { next(err); }
};
