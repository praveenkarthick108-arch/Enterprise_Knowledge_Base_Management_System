'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/bookmarkController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getAll);
router.post('/article/:articleId', ctrl.toggle);
router.delete('/article/:articleId', ctrl.remove);

module.exports = router;
