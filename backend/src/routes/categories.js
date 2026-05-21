'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/categoryController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.get('/', ctrl.getAll);
router.get('/:id/articles', ctrl.getArticles);
router.post('/', authenticate, requireAdmin, ctrl.create);
router.put('/:id', authenticate, requireAdmin, ctrl.update);
router.delete('/:id', authenticate, requireAdmin, ctrl.remove);

module.exports = router;
