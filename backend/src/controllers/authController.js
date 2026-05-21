'use strict';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Role } = require('../models');

const generateTokens = (userId, roleId) => {
  const accessToken = jwt.sign({ userId, roleId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' });
  return { accessToken, refreshToken };
};

const userResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  department: user.department,
  avatar: user.avatar,
  role: user.role,
  is_active: user.is_active,
  created_at: user.created_at,
  last_login: user.last_login
});

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ success: false, message: 'Email already registered' });

    const employeeRole = await Role.findOne({ where: { name: 'employee' } });
    const password_hash = await bcrypt.hash(password, 12);

    const user = await User.create({ name, email, password_hash, role_id: employeeRole.id, department });
    const fullUser = await User.findByPk(user.id, { include: [{ model: Role, as: 'role' }] });
    const { accessToken, refreshToken } = generateTokens(user.id, employeeRole.id);

    await user.update({ refresh_token: refreshToken, last_login: new Date() });

    res.status(201).json({ success: true, message: 'Registration successful', data: { user: userResponse(fullUser), accessToken, refreshToken } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email }, include: [{ model: Role, as: 'role' }] });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    if (!user.is_active) return res.status(403).json({ success: false, message: 'Account has been deactivated' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role_id);
    await user.update({ refresh_token: refreshToken, last_login: new Date() });

    res.json({ success: true, message: 'Login successful', data: { user: userResponse(user), accessToken, refreshToken } });
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId, { include: [{ model: Role, as: 'role' }] });

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefresh } = generateTokens(user.id, user.role_id);
    await user.update({ refresh_token: newRefresh });

    res.json({ success: true, data: { accessToken, refreshToken: newRefresh } });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    await req.user.update({ refresh_token: null });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, data: userResponse(req.user) });
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, department, avatar } = req.body;
    await req.user.update({ name, department, avatar });
    const updated = await User.findByPk(req.user.id, { include: [{ model: Role, as: 'role' }] });
    res.json({ success: true, message: 'Profile updated', data: userResponse(updated) });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const password_hash = await bcrypt.hash(newPassword, 12);
    await user.update({ password_hash });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.json({ success: true, message: 'If this email exists, a reset link has been sent' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await user.update({ reset_token: token, reset_token_expires: expires });

    // In production, send email. For now, return token in response (dev mode)
    res.json({ success: true, message: 'Password reset token generated', data: { resetToken: token, note: 'In production this would be sent via email' } });
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({ where: { reset_token: token } });

    if (!user || !user.reset_token_expires || user.reset_token_expires < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    const password_hash = await bcrypt.hash(newPassword, 12);
    await user.update({ password_hash, reset_token: null, reset_token_expires: null });

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) { next(err); }
};
