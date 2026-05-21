'use strict';
const path = require('path');
const fs = require('fs');
const { Attachment, Article } = require('../models');

exports.upload = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const article = await Article.unscoped().findByPk(req.params.articleId);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });

    const userRole = req.user.role?.name;
    if (article.author_id !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const attachments = await Attachment.bulkCreate(req.files.map(f => ({
      article_id: req.params.articleId,
      file_name: f.filename,
      original_name: f.originalname,
      mime_type: f.mimetype,
      file_size: f.size,
      file_path: f.path,
      uploaded_by: req.user.id
    })));

    res.status(201).json({ success: true, message: `${attachments.length} file(s) uploaded`, data: attachments });
  } catch (err) { next(err); }
};

exports.download = async (req, res, next) => {
  try {
    const att = await Attachment.findByPk(req.params.id);
    if (!att) return res.status(404).json({ success: false, message: 'File not found' });

    if (!fs.existsSync(att.file_path)) {
      return res.status(404).json({ success: false, message: 'File not found on disk' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${att.original_name}"`);
    res.setHeader('Content-Type', att.mime_type || 'application/octet-stream');
    res.sendFile(path.resolve(att.file_path));
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const att = await Attachment.findByPk(req.params.id, { include: [{ model: Article }] });
    if (!att) return res.status(404).json({ success: false, message: 'Attachment not found' });

    const userRole = req.user.role?.name;
    if (att.uploaded_by !== req.user.id && userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (fs.existsSync(att.file_path)) fs.unlinkSync(att.file_path);
    await att.destroy();

    res.json({ success: true, message: 'Attachment deleted' });
  } catch (err) { next(err); }
};
