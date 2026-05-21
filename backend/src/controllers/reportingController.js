'use strict';
const { spawn } = require('child_process');
const path = require('path');
const { Op } = require('sequelize');
const {
  EtlRunLog,
  EtlArticleAnalytic,
  EtlCategoryTrend,
  EtlSearchKeyword,
  EtlAuthorActivity,
} = require('../models');

// GET /api/reporting/etl-status
const getEtlStatus = async (req, res) => {
  try {
    const latest = await EtlRunLog.findOne({ order: [['run_date', 'DESC']] });
    const totalRuns = await EtlRunLog.count();
    const successRuns = await EtlRunLog.count({ where: { status: 'success' } });

    res.json({
      success: true,
      data: {
        latestRun: latest,
        totalRuns,
        successRuns,
        hasData: !!latest,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reporting/top-articles?limit=20
const getTopArticles = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const data = await EtlArticleAnalytic.findAll({
      order: [['engagement_score', 'DESC']],
      limit,
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reporting/category-trends
const getCategoryTrends = async (req, res) => {
  try {
    const data = await EtlCategoryTrend.findAll({
      order: [['total_views', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reporting/search-keywords?limit=30
const getSearchKeywords = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const data = await EtlSearchKeyword.findAll({
      order: [['search_count', 'DESC']],
      limit,
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reporting/author-activity
const getAuthorActivity = async (req, res) => {
  try {
    const data = await EtlAuthorActivity.findAll({
      order: [['total_views', 'DESC']],
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reporting/etl-history?limit=10
const getEtlHistory = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const data = await EtlRunLog.findAll({
      order: [['run_date', 'DESC']],
      limit,
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reporting/summary  – combined summary for the dashboard header cards
const getSummary = async (req, res) => {
  try {
    const [articleCount, categoryCount, keywordCount, authorCount, latestRun] =
      await Promise.all([
        EtlArticleAnalytic.count(),
        EtlCategoryTrend.count(),
        EtlSearchKeyword.count(),
        EtlAuthorActivity.count(),
        EtlRunLog.findOne({ order: [['run_date', 'DESC']] }),
      ]);

    const totalViews = await EtlArticleAnalytic.sum('view_count') || 0;
    const avgEngagement = await EtlArticleAnalytic.findOne({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('engagement_score')), 'avg_score'],
      ],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        articleCount,
        categoryCount,
        keywordCount,
        authorCount,
        totalViews,
        avgEngagementScore: avgEngagement ? parseFloat(avgEngagement.avg_score || 0).toFixed(2) : '0.00',
        latestRun,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/reporting/trigger-etl  (admin only)
const triggerEtlRun = async (req, res) => {
  try {
    const etlScript = path.join(__dirname, '..', '..', '..', '..', 'etl', 'run_etl.py');

    const proc = spawn('python', [etlScript], {
      detached: true,
      stdio: 'ignore',
      cwd: path.dirname(etlScript),
    });
    proc.unref();

    res.json({
      success: true,
      message: 'ETL pipeline triggered successfully. Check etl-history in a few seconds.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getEtlStatus,
  getTopArticles,
  getCategoryTrends,
  getSearchKeywords,
  getAuthorActivity,
  getEtlHistory,
  getSummary,
  triggerEtlRun,
};
