'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Article', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(300), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    excerpt: { type: DataTypes.TEXT },
    category_id: { type: DataTypes.INTEGER },
    author_id: { type: DataTypes.UUID, allowNull: false },
    reviewer_id: { type: DataTypes.UUID },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'approved', 'rejected', 'archived'),
      defaultValue: 'draft'
    },
    view_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    rejection_reason: { type: DataTypes.TEXT },
    reviewed_at: { type: DataTypes.DATE },
    published_at: { type: DataTypes.DATE },
    is_deleted: { type: DataTypes.BOOLEAN, defaultValue: false },
    search_vector: { type: DataTypes.TSVECTOR }
  }, {
    tableName: 'articles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    defaultScope: { where: { is_deleted: false } },
    scopes: {
      withDeleted: { where: {} },
      published: { where: { status: 'approved', is_deleted: false } }
    }
  });
};
