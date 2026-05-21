'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

router.get('/article/:articleId', authenticate, ctrl.getByArticle);
router.post('/article/:articleId', authenticate, ctrl.create);
router.put('/:id', authenticate, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);

module.exports = router;
