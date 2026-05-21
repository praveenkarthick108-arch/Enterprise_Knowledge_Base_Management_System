'use strict';
const router = require('express').Router();
const ctrl = require('../controllers/attachmentController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

router.post('/article/:articleId', authenticate, upload.array('files', 10), ctrl.upload);
router.get('/:id/download', ctrl.download);
router.delete('/:id', authenticate, ctrl.remove);

module.exports = router;
