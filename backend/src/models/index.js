'use strict';
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'enterprise_kb',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 }
  }
);

// Import models
const Role = require('./Role')(sequelize);
const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Tag = require('./Tag')(sequelize);
const Article = require('./Article')(sequelize);
const ArticleTag = require('./ArticleTag')(sequelize);
const Attachment = require('./Attachment')(sequelize);
const Comment = require('./Comment')(sequelize);
const Rating = require('./Rating')(sequelize);
const Bookmark = require('./Bookmark')(sequelize);
const ApprovalHistory = require('./ApprovalHistory')(sequelize);
const ArticleVersion = require('./ArticleVersion')(sequelize);
const SearchLog = require('./SearchLog')(sequelize);
const ArticleView = require('./ArticleView')(sequelize);

// ETL / Reporting models (Phase 2)
const EtlRunLog = require('./EtlRunLog')(sequelize);
const EtlArticleAnalytic = require('./EtlArticleAnalytic')(sequelize);
const EtlCategoryTrend = require('./EtlCategoryTrend')(sequelize);
const EtlSearchKeyword = require('./EtlSearchKeyword')(sequelize);
const EtlAuthorActivity = require('./EtlAuthorActivity')(sequelize);

// Associations
Role.hasMany(User, { foreignKey: 'role_id' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

Category.hasMany(Category, { foreignKey: 'parent_id', as: 'children' });
Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });
Category.hasMany(Article, { foreignKey: 'category_id' });
Article.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

User.hasMany(Article, { foreignKey: 'author_id' });
Article.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
User.hasMany(Article, { foreignKey: 'reviewer_id' });
Article.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });

Article.belongsToMany(Tag, { through: ArticleTag, foreignKey: 'article_id' });
Tag.belongsToMany(Article, { through: ArticleTag, foreignKey: 'tag_id' });

Article.hasMany(Attachment, { foreignKey: 'article_id', as: 'attachments' });
Attachment.belongsTo(Article, { foreignKey: 'article_id' });

Article.hasMany(Comment, { foreignKey: 'article_id', as: 'comments' });
Comment.belongsTo(Article, { foreignKey: 'article_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });
Comment.hasMany(Comment, { foreignKey: 'parent_id', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parent_id', as: 'parent' });

Article.hasMany(Rating, { foreignKey: 'article_id', as: 'ratings' });
Rating.belongsTo(Article, { foreignKey: 'article_id' });
User.hasMany(Rating, { foreignKey: 'user_id' });
Rating.belongsTo(User, { foreignKey: 'user_id' });

Article.hasMany(Bookmark, { foreignKey: 'article_id' });
Bookmark.belongsTo(Article, { foreignKey: 'article_id' });
User.hasMany(Bookmark, { foreignKey: 'user_id' });
Bookmark.belongsTo(User, { foreignKey: 'user_id' });

Article.hasMany(ApprovalHistory, { foreignKey: 'article_id', as: 'approvalHistory' });
ApprovalHistory.belongsTo(Article, { foreignKey: 'article_id' });
User.hasMany(ApprovalHistory, { foreignKey: 'reviewer_id' });
ApprovalHistory.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });

Article.hasMany(ArticleVersion, { foreignKey: 'article_id', as: 'versions' });
ArticleVersion.belongsTo(Article, { foreignKey: 'article_id' });
User.hasMany(ArticleVersion, { foreignKey: 'saved_by' });
ArticleVersion.belongsTo(User, { foreignKey: 'saved_by', as: 'savedBy' });

Article.hasMany(ArticleView, { foreignKey: 'article_id' });
ArticleView.belongsTo(Article, { foreignKey: 'article_id' });

module.exports = {
  sequelize,
  Sequelize,
  Role,
  User,
  Category,
  Tag,
  Article,
  ArticleTag,
  Attachment,
  Comment,
  Rating,
  Bookmark,
  ApprovalHistory,
  ArticleVersion,
  SearchLog,
  ArticleView,
  // ETL / Reporting (Phase 2)
  EtlRunLog,
  EtlArticleAnalytic,
  EtlCategoryTrend,
  EtlSearchKeyword,
  EtlAuthorActivity,
};
