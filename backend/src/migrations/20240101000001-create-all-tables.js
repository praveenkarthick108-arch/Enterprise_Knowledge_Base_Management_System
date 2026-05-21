'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Roles
    await queryInterface.createTable('roles', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      description: { type: Sequelize.STRING(255) },
      createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Users
    await queryInterface.createTable('users', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      name: { type: Sequelize.STRING(150), allowNull: false },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      role_id: { type: Sequelize.INTEGER, references: { model: 'roles', key: 'id' } },
      avatar: { type: Sequelize.STRING(500) },
      department: { type: Sequelize.STRING(100) },
      is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
      refresh_token: { type: Sequelize.TEXT },
      reset_token: { type: Sequelize.STRING(255) },
      reset_token_expires: { type: Sequelize.DATE },
      last_login: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Categories
    await queryInterface.createTable('categories', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.TEXT },
      slug: { type: Sequelize.STRING(120), unique: true },
      icon: { type: Sequelize.STRING(50), defaultValue: 'folder' },
      parent_id: { type: Sequelize.INTEGER, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' },
      created_by: { type: Sequelize.UUID },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Tags
    await queryInterface.createTable('tags', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: Sequelize.STRING(80), allowNull: false, unique: true },
      slug: { type: Sequelize.STRING(90), unique: true },
      color: { type: Sequelize.STRING(7), defaultValue: '#6366f1' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Articles
    await queryInterface.createTable('articles', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      title: { type: Sequelize.STRING(300), allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      excerpt: { type: Sequelize.TEXT },
      category_id: { type: Sequelize.INTEGER, references: { model: 'categories', key: 'id' }, onDelete: 'SET NULL' },
      author_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      reviewer_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' } },
      status: { type: Sequelize.ENUM('draft', 'pending', 'approved', 'rejected', 'archived'), defaultValue: 'draft' },
      view_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      rejection_reason: { type: Sequelize.TEXT },
      reviewed_at: { type: Sequelize.DATE },
      published_at: { type: Sequelize.DATE },
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      search_vector: { type: 'TSVECTOR' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Full-text search index
    await queryInterface.sequelize.query(`
      CREATE INDEX articles_search_idx ON articles USING GIN(search_vector);
    `);

    // Search vector trigger
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION articles_search_vector_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector := to_tsvector('english', COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.excerpt, '') || ' ' || COALESCE(substring(NEW.content from 1 for 5000), ''));
        RETURN NEW;
      END
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER articles_search_vector_trigger
      BEFORE INSERT OR UPDATE ON articles
      FOR EACH ROW EXECUTE FUNCTION articles_search_vector_update();
    `);

    // Article Tags
    await queryInterface.createTable('article_tags', {
      article_id: { type: Sequelize.UUID, primaryKey: true, references: { model: 'articles', key: 'id' }, onDelete: 'CASCADE' },
      tag_id: { type: Sequelize.INTEGER, primaryKey: true, references: { model: 'tags', key: 'id' }, onDelete: 'CASCADE' }
    });

    // Attachments
    await queryInterface.createTable('attachments', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      article_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'articles', key: 'id' }, onDelete: 'CASCADE' },
      file_name: { type: Sequelize.STRING(255), allowNull: false },
      original_name: { type: Sequelize.STRING(255), allowNull: false },
      mime_type: { type: Sequelize.STRING(100) },
      file_size: { type: Sequelize.BIGINT },
      file_path: { type: Sequelize.STRING(500), allowNull: false },
      uploaded_by: { type: Sequelize.UUID },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Comments
    await queryInterface.createTable('comments', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      article_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'articles', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      content: { type: Sequelize.TEXT, allowNull: false },
      parent_id: { type: Sequelize.UUID, references: { model: 'comments', key: 'id' }, onDelete: 'CASCADE' },
      is_deleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Ratings
    await queryInterface.createTable('ratings', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      article_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'articles', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      score: { type: Sequelize.INTEGER, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
    await queryInterface.addConstraint('ratings', { fields: ['article_id', 'user_id'], type: 'unique', name: 'ratings_article_user_unique' });

    // Bookmarks
    await queryInterface.createTable('bookmarks', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      article_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'articles', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
    await queryInterface.addConstraint('bookmarks', { fields: ['article_id', 'user_id'], type: 'unique', name: 'bookmarks_article_user_unique' });

    // Approval History
    await queryInterface.createTable('approval_history', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      article_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'articles', key: 'id' }, onDelete: 'CASCADE' },
      reviewer_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      action: { type: Sequelize.ENUM('submitted', 'approved', 'rejected'), allowNull: false },
      comment: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Article Versions
    await queryInterface.createTable('article_versions', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      article_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'articles', key: 'id' }, onDelete: 'CASCADE' },
      title: { type: Sequelize.STRING(300), allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      version_number: { type: Sequelize.INTEGER, allowNull: false },
      saved_by: { type: Sequelize.UUID, allowNull: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Search Logs
    await queryInterface.createTable('search_logs', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      query: { type: Sequelize.STRING(500), allowNull: false },
      user_id: { type: Sequelize.UUID },
      results_count: { type: Sequelize.INTEGER, defaultValue: 0 },
      ip_address: { type: Sequelize.STRING(50) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });

    // Article Views
    await queryInterface.createTable('article_views', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
      article_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'articles', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.UUID },
      ip_address: { type: Sequelize.STRING(50) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('DROP TRIGGER IF EXISTS articles_search_vector_trigger ON articles;');
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS articles_search_vector_update;');
    await queryInterface.dropTable('article_views');
    await queryInterface.dropTable('search_logs');
    await queryInterface.dropTable('article_versions');
    await queryInterface.dropTable('approval_history');
    await queryInterface.dropTable('bookmarks');
    await queryInterface.dropTable('ratings');
    await queryInterface.dropTable('comments');
    await queryInterface.dropTable('attachments');
    await queryInterface.dropTable('article_tags');
    await queryInterface.dropTable('articles');
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_articles_status;");
    await queryInterface.dropTable('tags');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('users');
    await queryInterface.dropTable('roles');
    await queryInterface.sequelize.query("DROP TYPE IF EXISTS enum_approval_history_action;");
  }
};
