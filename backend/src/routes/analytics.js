'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/analyticsController');
const { authenticate } = require('../middleware/auth');
const { requireReviewerOrAbove } = require('../middleware/roleCheck');

router.use(authenticate, requireReviewerOrAbove);
router.get('/dashboard', ctrl.getDashboard);
router.get('/articles/popular', ctrl.getPopularArticles);
router.get('/articles/recent', ctrl.getRecentArticles);
router.get('/articles/stats', ctrl.getArticleStats);
router.get('/categories/popular', ctrl.getPopularCategories);
router.get('/search/trends', ctrl.getSearchTrends);
router.get('/users/active', ctrl.getActiveUsers);

module.exports = router;
