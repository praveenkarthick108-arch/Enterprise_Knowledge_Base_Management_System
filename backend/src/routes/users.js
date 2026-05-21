'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.use(authenticate);
router.get('/roles', ctrl.getRoles);
router.get('/stats', requireAdmin, ctrl.getStats);
router.get('/', requireAdmin, ctrl.getAll);
router.get('/:id', requireAdmin, ctrl.getOne);
router.put('/:id', requireAdmin, ctrl.update);
router.delete('/:id', requireAdmin, ctrl.deactivate);

module.exports = router;
