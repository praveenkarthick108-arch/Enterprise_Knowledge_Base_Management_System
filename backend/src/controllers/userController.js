'use strict';
const bcrypt = require('bcryptjs');
const { User, Role, Article } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, is_active } = req.query;
    const offset = (page - 1) * limit;
    const where = {};

    if (role) {
      const roleObj = await Role.findOne({ where: { name: role } });
      if (roleObj) where.role_id = roleObj.id;
    }
    if (search) where[Op.or] = [{ name: { [Op.iLike]: `%${search}%` } }, { email: { [Op.iLike]: `%${search}%` } }];
    if (is_active !== undefined) where.is_active = is_active === 'true';

    const { count, rows } = await User.findAndCountAll({
      where,
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
      attributes: { exclude: ['password_hash', 'refresh_token', 'reset_token'] },
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: { users: rows, pagination: { total: count, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(count / limit) } } });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password_hash', 'refresh_token', 'reset_token'] }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { name, department, role_id, is_active } = req.body;
    await user.update({ name, department, role_id, is_active });

    const updated = await User.findByPk(user.id, {
      include: [{ model: Role, as: 'role' }],
      attributes: { exclude: ['password_hash', 'refresh_token', 'reset_token'] }
    });

    res.json({ success: true, message: 'User updated', data: updated });
  } catch (err) { next(err); }
};

exports.deactivate = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.update({ is_active: false });
    res.json({ success: true, message: 'User deactivated' });
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const roles = await Role.findAll({ attributes: ['id', 'name'] });
    const stats = {};
    for (const role of roles) {
      stats[role.name] = await User.count({ where: { role_id: role.id, is_active: true } });
    }
    const total = await User.count();
    const active = await User.count({ where: { is_active: true } });
    res.json({ success: true, data: { total, active, inactive: total - active, byRole: stats } });
  } catch (err) { next(err); }
};

exports.getRoles = async (req, res, next) => {
  try {
    const roles = await Role.findAll({ order: [['id', 'ASC']] });
    res.json({ success: true, data: roles });
  } catch (err) { next(err); }
};
