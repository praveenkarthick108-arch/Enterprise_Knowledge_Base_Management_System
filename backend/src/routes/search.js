'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, ctrl.search);
router.get('/suggestions', ctrl.suggestions);
router.get('/trending', ctrl.trending);

module.exports = router;
