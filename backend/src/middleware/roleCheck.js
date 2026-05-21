'use strict';

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  const userRole = req.user.role?.name;
  if (!roles.includes(userRole)) {
    return res.status(403).json({ success: false, message: `Access restricted to: ${roles.join(', ')}` });
  }
  next();
};

const requireAdmin = requireRole('admin');
const requireAuthorOrAbove = requireRole('admin', 'author', 'reviewer');
const requireReviewerOrAbove = requireRole('admin', 'reviewer');

module.exports = { requireRole, requireAdmin, requireAuthorOrAbove, requireReviewerOrAbove };
