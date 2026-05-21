'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/tagController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin, requireAuthorOrAbove } = require('../middleware/roleCheck');

router.get('/', ctrl.getAll);
router.post('/', authenticate, requireAuthorOrAbove, ctrl.create);
router.put('/:id', authenticate, requireAdmin, ctrl.update);
router.delete('/:id', authenticate, requireAdmin, ctrl.remove);

module.exports = router;
