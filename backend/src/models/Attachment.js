'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Attachment', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    article_id: { type: DataTypes.UUID, allowNull: false },
    file_name: { type: DataTypes.STRING(255), allowNull: false },
    original_name: { type: DataTypes.STRING(255), allowNull: false },
    mime_type: { type: DataTypes.STRING(100) },
    file_size: { type: DataTypes.BIGINT },
    file_path: { type: DataTypes.STRING(500), allowNull: false },
    uploaded_by: { type: DataTypes.UUID }
  }, {
    tableName: 'attachments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });
};
