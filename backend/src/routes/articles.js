'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/articleController');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { requireAuthorOrAbove, requireAdmin, requireReviewerOrAbove } = require('../middleware/roleCheck');

router.get('/', optionalAuth, ctrl.getAll);
router.get('/my', authenticate, ctrl.getMyArticles);
router.get('/:id', optionalAuth, ctrl.getOne);
router.get('/:id/versions', authenticate, ctrl.getVersions);
router.post('/', authenticate, requireAuthorOrAbove, ctrl.create);
router.put('/:id', authenticate, ctrl.update);
router.delete('/:id', authenticate, ctrl.remove);
router.post('/:id/submit', authenticate, ctrl.submit);
router.post('/:id/publish', authenticate, requireReviewerOrAbove, ctrl.publish);
router.post('/:id/archive', authenticate, requireReviewerOrAbove, ctrl.archive);

module.exports = router;
