'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('ApprovalHistory', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    article_id: { type: DataTypes.UUID, allowNull: false },
    reviewer_id: { type: DataTypes.UUID, allowNull: false },
    action: { type: DataTypes.ENUM('submitted', 'approved', 'rejected'), allowNull: false },
    comment: { type: DataTypes.TEXT }
  }, {
    tableName: 'approval_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });
};
