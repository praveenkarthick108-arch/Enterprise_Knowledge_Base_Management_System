'use strict';
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const {
  getEtlStatus,
  getTopArticles,
  getCategoryTrends,
  getSearchKeywords,
  getAuthorActivity,
  getEtlHistory,
  getSummary,
  triggerEtlRun,
} = require('../controllers/reportingController');

// All reporting routes require authentication
router.use(authenticate);

router.get('/summary',         getSummary);
router.get('/etl-status',      getEtlStatus);
router.get('/top-articles',    getTopArticles);
router.get('/category-trends', getCategoryTrends);
router.get('/search-keywords', getSearchKeywords);
router.get('/author-activity', getAuthorActivity);
router.get('/etl-history',     getEtlHistory);

// Admin only – trigger a new ETL run
router.post('/trigger-etl', requireAdmin, triggerEtlRun);

module.exports = router;
