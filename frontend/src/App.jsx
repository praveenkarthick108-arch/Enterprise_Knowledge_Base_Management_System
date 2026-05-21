import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import AppLayout from './components/layout/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ArticleListPage from './pages/ArticleListPage';
import ArticleCreatePage from './pages/ArticleCreatePage';
import ArticleEditPage from './pages/ArticleEditPage';
import ArticleViewPage from './pages/ArticleViewPage';
import CategoryManagementPage from './pages/CategoryManagementPage';
import TagManagementPage from './pages/TagManagementPage';
import SearchPage from './pages/SearchPage';
import ApprovalQueuePage from './pages/ApprovalQueuePage';
import BookmarksPage from './pages/BookmarksPage';
import UserManagementPage from './pages/UserManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import MyArticlesPage from './pages/MyArticlesPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, accessToken } = useAuthStore();
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role?.name)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { accessToken } = useAuthStore();
  if (accessToken) return <Navigate to="/dashboard" replace />;
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
        <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="articles" element={<ArticleListPage />} />
          <Route path="articles/my" element={<MyArticlesPage />} />
          <Route path="articles/create" element={<ProtectedRoute roles={['admin', 'author']}><ArticleCreatePage /></ProtectedRoute>} />
          <Route path="articles/:id" element={<ArticleViewPage />} />
          <Route path="articles/:id/edit" element={<ArticleEditPage />} />
          <Route path="categories" element={<ProtectedRoute roles={['admin']}><CategoryManagementPage /></ProtectedRoute>} />
          <Route path="tags" element={<ProtectedRoute roles={['admin', 'author']}><TagManagementPage /></ProtectedRoute>} />
          <Route path="search" element={<SearchPage />} />
          <Route path="approvals" element={<ProtectedRoute roles={['admin', 'reviewer']}><ApprovalQueuePage /></ProtectedRoute>} />
          <Route path="bookmarks" element={<BookmarksPage />} />
          <Route path="users" element={<ProtectedRoute roles={['admin']}><UserManagementPage /></ProtectedRoute>} />
          <Route path="analytics" element={<ProtectedRoute roles={['admin', 'reviewer']}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
