import apiClient from './apiClient';

// Auth
export const authApi = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  updateMe: (data) => apiClient.put('/auth/me', data),
  changePassword: (data) => apiClient.put('/auth/me/password', data),
  forgotPassword: (email) => apiClient.post('/auth/forgot-password', { email }),
  resetPassword: (data) => apiClient.post('/auth/reset-password', data),
};

// Articles
export const articleApi = {
  getAll: (params) => apiClient.get('/articles', { params }),
  getMy: (params) => apiClient.get('/articles/my', { params }),
  getOne: (id) => apiClient.get(`/articles/${id}`),
  getVersions: (id) => apiClient.get(`/articles/${id}/versions`),
  create: (data) => apiClient.post('/articles', data),
  update: (id, data) => apiClient.put(`/articles/${id}`, data),
  remove: (id) => apiClient.delete(`/articles/${id}`),
  submit: (id, comment) => apiClient.post(`/articles/${id}/submit`, { comment }),
  publish: (id) => apiClient.post(`/articles/${id}/publish`),
  archive: (id) => apiClient.post(`/articles/${id}/archive`),
};

// Categories
export const categoryApi = {
  getAll: (params) => apiClient.get('/categories', { params }),
  create: (data) => apiClient.post('/categories', data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  remove: (id) => apiClient.delete(`/categories/${id}`),
};

// Tags
export const tagApi = {
  getAll: () => apiClient.get('/tags'),
  create: (data) => apiClient.post('/tags', data),
  update: (id, data) => apiClient.put(`/tags/${id}`, data),
  remove: (id) => apiClient.delete(`/tags/${id}`),
};

// Approvals
export const approvalApi = {
  getQueue: (params) => apiClient.get('/approvals/queue', { params }),
  approve: (articleId, comment) => apiClient.post(`/approvals/${articleId}/approve`, { comment }),
  reject: (articleId, comment) => apiClient.post(`/approvals/${articleId}/reject`, { comment }),
  getHistory: (articleId) => apiClient.get(`/approvals/${articleId}/history`),
};

// Comments
export const commentApi = {
  getByArticle: (articleId) => apiClient.get(`/comments/article/${articleId}`),
  create: (articleId, data) => apiClient.post(`/comments/article/${articleId}`, data),
  update: (id, content) => apiClient.put(`/comments/${id}`, { content }),
  remove: (id) => apiClient.delete(`/comments/${id}`),
};

// Ratings
export const ratingApi = {
  rate: (articleId, score) => apiClient.post(`/ratings/article/${articleId}`, { score }),
  getSummary: (articleId) => apiClient.get(`/ratings/article/${articleId}`),
};

// Bookmarks
export const bookmarkApi = {
  getAll: (params) => apiClient.get('/bookmarks', { params }),
  toggle: (articleId) => apiClient.post(`/bookmarks/article/${articleId}`),
  remove: (articleId) => apiClient.delete(`/bookmarks/article/${articleId}`),
};

// Attachments
export const attachmentApi = {
  upload: (articleId, files) => {
    const fd = new FormData();
    files.forEach(f => fd.append('files', f));
    return apiClient.post(`/attachments/article/${articleId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  download: (id) => `/api/attachments/${id}/download`,
  remove: (id) => apiClient.delete(`/attachments/${id}`),
};

// Search
export const searchApi = {
  search: (params) => apiClient.get('/search', { params }),
  suggestions: (q) => apiClient.get('/search/suggestions', { params: { q } }),
  trending: () => apiClient.get('/search/trending'),
};

// Analytics
export const analyticsApi = {
  getDashboard: () => apiClient.get('/analytics/dashboard'),
  getPopularArticles: () => apiClient.get('/analytics/articles/popular'),
  getRecentArticles: () => apiClient.get('/analytics/articles/recent'),
  getArticleStats: () => apiClient.get('/analytics/articles/stats'),
  getPopularCategories: () => apiClient.get('/analytics/categories/popular'),
  getSearchTrends: () => apiClient.get('/analytics/search/trends'),
  getActiveUsers: () => apiClient.get('/analytics/users/active'),
};

// Users
export const userApi = {
  getAll: (params) => apiClient.get('/users', { params }),
  getOne: (id) => apiClient.get(`/users/${id}`),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  deactivate: (id) => apiClient.delete(`/users/${id}`),
  getStats: () => apiClient.get('/users/stats'),
  getRoles: () => apiClient.get('/users/roles'),
};
