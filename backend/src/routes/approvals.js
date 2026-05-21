'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/approvalController');
const { authenticate } = require('../middleware/auth');
const { requireReviewerOrAbove } = require('../middleware/roleCheck');

router.use(authenticate);
router.get('/queue', requireReviewerOrAbove, ctrl.getQueue);
router.post('/:articleId/approve', requireReviewerOrAbove, ctrl.approve);
router.post('/:articleId/reject', requireReviewerOrAbove, ctrl.reject);
router.get('/:articleId/history', ctrl.getHistory);

module.exports = router;
