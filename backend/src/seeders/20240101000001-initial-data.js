'use strict';
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    // Roles
    await queryInterface.bulkInsert('roles', [
      { id: 1, name: 'admin', description: 'Full system access', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'author', description: 'Create and manage content', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'reviewer', description: 'Approve or reject articles', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'employee', description: 'Read and interact with content', createdAt: new Date(), updatedAt: new Date() }
    ]);

    // Users
    const adminId = uuidv4();
    const authorId = uuidv4();
    const reviewerId = uuidv4();
    const employeeId = uuidv4();
    const salt = 12;

    await queryInterface.bulkInsert('users', [
      { id: adminId, name: 'System Administrator', email: 'admin@company.com', password_hash: bcrypt.hashSync('Admin@123', salt), role_id: 1, department: 'IT', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: authorId, name: 'Jane Author', email: 'author@company.com', password_hash: bcrypt.hashSync('Author@123', salt), role_id: 2, department: 'Knowledge Management', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: reviewerId, name: 'Bob Reviewer', email: 'reviewer@company.com', password_hash: bcrypt.hashSync('Review@123', salt), role_id: 3, department: 'Quality Assurance', is_active: true, created_at: new Date(), updated_at: new Date() },
      { id: employeeId, name: 'Alice Employee', email: 'employee@company.com', password_hash: bcrypt.hashSync('Employee@123', salt), role_id: 4, department: 'Operations', is_active: true, created_at: new Date(), updated_at: new Date() }
    ]);

    // Categories
    await queryInterface.bulkInsert('categories', [
      { id: 1, name: 'HR Policies', description: 'Human resources policies and procedures', slug: 'hr-policies', icon: 'users', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { id: 2, name: 'IT Support', description: 'Technical support guides and troubleshooting', slug: 'it-support', icon: 'computer-desktop', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { id: 3, name: 'Infrastructure', description: 'Network and infrastructure documentation', slug: 'infrastructure', icon: 'server', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { id: 4, name: 'Training Materials', description: 'Employee training and onboarding resources', slug: 'training-materials', icon: 'academic-cap', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { id: 5, name: 'Finance', description: 'Finance policies and procedures', slug: 'finance', icon: 'currency-dollar', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { id: 6, name: 'Operations', description: 'Operational guides and SOPs', slug: 'operations', icon: 'cog-6-tooth', created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { id: 7, name: 'Onboarding', description: 'New employee onboarding documents', slug: 'onboarding', icon: 'user-plus', parent_id: 4, created_by: adminId, created_at: new Date(), updated_at: new Date() },
      { id: 8, name: 'Network Security', description: 'Network security guidelines and policies', slug: 'network-security', icon: 'shield-check', parent_id: 3, created_by: adminId, created_at: new Date(), updated_at: new Date() }
    ]);

    // Tags
    await queryInterface.bulkInsert('tags', [
      { id: 1, name: 'urgent', slug: 'urgent', color: '#ef4444', created_at: new Date(), updated_at: new Date() },
      { id: 2, name: 'howto', slug: 'howto', color: '#3b82f6', created_at: new Date(), updated_at: new Date() },
      { id: 3, name: 'policy', slug: 'policy', color: '#8b5cf6', created_at: new Date(), updated_at: new Date() },
      { id: 4, name: 'sop', slug: 'sop', color: '#f59e0b', created_at: new Date(), updated_at: new Date() },
      { id: 5, name: 'tutorial', slug: 'tutorial', color: '#10b981', created_at: new Date(), updated_at: new Date() },
      { id: 6, name: 'faq', slug: 'faq', color: '#06b6d4', created_at: new Date(), updated_at: new Date() },
      { id: 7, name: 'onboarding', slug: 'onboarding', color: '#f97316', created_at: new Date(), updated_at: new Date() },
      { id: 8, name: 'security', slug: 'security', color: '#dc2626', created_at: new Date(), updated_at: new Date() },
      { id: 9, name: 'network', slug: 'network', color: '#0ea5e9', created_at: new Date(), updated_at: new Date() },
      { id: 10, name: 'software', slug: 'software', color: '#6366f1', created_at: new Date(), updated_at: new Date() }
    ]);

    // Sample Articles
    const article1Id = uuidv4();
    const article2Id = uuidv4();
    const article3Id = uuidv4();
    const article4Id = uuidv4();
    const article5Id = uuidv4();

    await queryInterface.bulkInsert('articles', [
      {
        id: article1Id,
        title: 'Employee Leave Policy 2024',
        content: '<h2>Leave Policy Overview</h2><p>This document outlines the comprehensive leave policy for all employees of the organization for the year 2024.</p><h3>Annual Leave</h3><p>All full-time employees are entitled to <strong>21 days</strong> of annual leave per year. Part-time employees receive leave on a pro-rata basis.</p><h3>Sick Leave</h3><p>Employees are entitled to <strong>10 days</strong> of paid sick leave annually. A medical certificate is required for absences exceeding 3 consecutive days.</p><h3>Maternity/Paternity Leave</h3><p>Maternity leave: 16 weeks paid leave. Paternity leave: 2 weeks paid leave. Adoption leave follows the same policy as maternity leave.</p>',
        excerpt: 'Comprehensive leave policy for all employees including annual, sick, and maternity/paternity leave entitlements.',
        category_id: 1,
        author_id: authorId,
        reviewer_id: reviewerId,
        status: 'approved',
        view_count: 245,
        published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        reviewed_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        is_deleted: false,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updated_at: new Date()
      },
      {
        id: article2Id,
        title: 'VPN Setup and Configuration Guide',
        content: '<h2>VPN Setup Guide</h2><p>This guide explains how to set up the corporate VPN on your device to securely access company resources remotely.</p><h3>Step 1: Download the VPN Client</h3><p>Visit the IT portal and download the approved VPN client for your operating system.</p><h3>Step 2: Install the Client</h3><p>Run the installer and follow the on-screen instructions. Accept the company certificate when prompted.</p><h3>Step 3: Configure the Connection</h3><p>Enter the VPN server address: <code>vpn.company.com</code>. Use your Active Directory credentials to authenticate.</p><h3>Troubleshooting</h3><p>If you cannot connect, ensure you are not already connected to a personal VPN. Contact IT support at ext. 4000.</p>',
        excerpt: 'Step-by-step guide for setting up and configuring the corporate VPN client on Windows, Mac, and Linux devices.',
        category_id: 2,
        author_id: authorId,
        reviewer_id: reviewerId,
        status: 'approved',
        view_count: 412,
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        reviewed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        is_deleted: false,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updated_at: new Date()
      },
      {
        id: article3Id,
        title: 'New Employee Onboarding Checklist',
        content: '<h2>Welcome to the Team!</h2><p>This checklist will help you get started on your first week. Please complete all items and check them off as you go.</p><h3>Day 1 Checklist</h3><ul><li>Meet with your manager and team</li><li>Set up your workstation and accounts</li><li>Complete HR paperwork</li><li>Review the employee handbook</li></ul><h3>Week 1 Checklist</h3><ul><li>Complete mandatory training modules</li><li>Set up email and calendar</li><li>Join relevant Slack channels</li><li>Schedule 1-on-1s with key stakeholders</li></ul>',
        excerpt: 'Complete onboarding checklist for new employees covering the first day, first week, and first month activities.',
        category_id: 7,
        author_id: authorId,
        status: 'pending',
        view_count: 0,
        is_deleted: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updated_at: new Date()
      },
      {
        id: article4Id,
        title: 'Password Security Best Practices',
        content: '<h2>Password Security Guidelines</h2><p>Strong passwords are your first line of defense against unauthorized access. Follow these guidelines to keep your accounts secure.</p><h3>Password Requirements</h3><ul><li>Minimum 12 characters</li><li>Mix of uppercase, lowercase, numbers, and symbols</li><li>No dictionary words or personal information</li><li>Never reuse passwords across systems</li></ul>',
        excerpt: 'Essential password security guidelines and best practices for all company employees.',
        category_id: 8,
        author_id: authorId,
        status: 'draft',
        view_count: 0,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: article5Id,
        title: 'Expense Reimbursement Process',
        content: '<h2>Expense Reimbursement Policy</h2><p>This document outlines the process for submitting and receiving reimbursement for business expenses.</p><h3>Eligible Expenses</h3><p>Travel, accommodation, meals (up to $50/day), and business supplies are reimbursable with prior approval.</p><h3>Submission Process</h3><ol><li>Collect all receipts</li><li>Fill out the expense report form</li><li>Get manager approval</li><li>Submit to Finance within 30 days</li></ol>',
        excerpt: 'Step-by-step guide for submitting business expense reimbursement requests including eligible expenses and required documentation.',
        category_id: 5,
        author_id: authorId,
        reviewer_id: reviewerId,
        status: 'rejected',
        rejection_reason: 'Missing approval limits table. Please add the expense approval thresholds by management level.',
        view_count: 0,
        reviewed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        is_deleted: false,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updated_at: new Date()
      }
    ]);

    // Article Tags
    await queryInterface.bulkInsert('article_tags', [
      { article_id: article1Id, tag_id: 3 },
      { article_id: article1Id, tag_id: 6 },
      { article_id: article2Id, tag_id: 2 },
      { article_id: article2Id, tag_id: 10 },
      { article_id: article3Id, tag_id: 7 },
      { article_id: article3Id, tag_id: 5 },
      { article_id: article4Id, tag_id: 8 },
      { article_id: article4Id, tag_id: 4 },
      { article_id: article5Id, tag_id: 4 },
      { article_id: article5Id, tag_id: 6 }
    ]);

    // Approval History
    await queryInterface.bulkInsert('approval_history', [
      { id: uuidv4(), article_id: article1Id, reviewer_id: authorId, action: 'submitted', comment: 'Ready for review', created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
      { id: uuidv4(), article_id: article1Id, reviewer_id: reviewerId, action: 'approved', comment: 'Well documented and accurate.', created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { id: uuidv4(), article_id: article2Id, reviewer_id: authorId, action: 'submitted', comment: 'Please review this VPN guide', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { id: uuidv4(), article_id: article2Id, reviewer_id: reviewerId, action: 'approved', comment: 'Approved - clear and concise.', created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { id: uuidv4(), article_id: article5Id, reviewer_id: authorId, action: 'submitted', comment: 'Expense policy for review', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { id: uuidv4(), article_id: article5Id, reviewer_id: reviewerId, action: 'rejected', comment: 'Missing approval limits table. Please add the expense approval thresholds by management level.', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
    ]);

    // Sample Comments
    await queryInterface.bulkInsert('comments', [
      { id: uuidv4(), article_id: article1Id, user_id: employeeId, content: 'This is very helpful! Does this policy apply to contractors as well?', is_deleted: false, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), updated_at: new Date() },
      { id: uuidv4(), article_id: article1Id, user_id: authorId, content: 'The policy applies only to full-time and part-time employees. Contractors should refer to their individual agreements.', is_deleted: false, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), updated_at: new Date() },
      { id: uuidv4(), article_id: article2Id, user_id: employeeId, content: 'Great guide! What if we need help with Mac setup?', is_deleted: false, created_at: new Date(Date.now() - 12 * 60 * 60 * 1000), updated_at: new Date() }
    ]);

    // Sample Ratings
    await queryInterface.bulkInsert('ratings', [
      { id: uuidv4(), article_id: article1Id, user_id: employeeId, score: 5, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), article_id: article2Id, user_id: employeeId, score: 4, created_at: new Date(), updated_at: new Date() }
    ]);

    // Sample Bookmarks
    await queryInterface.bulkInsert('bookmarks', [
      { id: uuidv4(), article_id: article1Id, user_id: employeeId, created_at: new Date(), updated_at: new Date() },
      { id: uuidv4(), article_id: article2Id, user_id: employeeId, created_at: new Date(), updated_at: new Date() }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('bookmarks', null, {});
    await queryInterface.bulkDelete('ratings', null, {});
    await queryInterface.bulkDelete('comments', null, {});
    await queryInterface.bulkDelete('approval_history', null, {});
    await queryInterface.bulkDelete('article_tags', null, {});
    await queryInterface.bulkDelete('articles', null, {});
    await queryInterface.bulkDelete('tags', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};
