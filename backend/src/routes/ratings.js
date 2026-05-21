'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/ratingController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/article/:articleId', optionalAuth, ctrl.getSummary);
router.post('/article/:articleId', authenticate, ctrl.rate);

module.exports = router;
