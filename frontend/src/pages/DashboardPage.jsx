import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { analyticsApi, articleApi } from '../services/api';
import useAuthStore from '../store/authStore';
import ArticleCard from '../components/articles/ArticleCard';
import { PageLoader } from '../components/ui/Spinner';
import {
  DocumentTextIcon, CheckCircleIcon, ClockIcon, UsersIcon,
  ArrowRightIcon, PlusIcon, BookmarkIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

export default function DashboardPage() {
  const { user } = useAuthStore();
  const role = user?.role?.name;
  const canSeeAnalytics = ['admin', 'reviewer'].includes(role);

  const { data: analyticsData, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsApi.getDashboard().then(r => r.data.data),
    enabled: canSeeAnalytics
  });

  const { data: recentData, isLoading: loadingRecent } = useQuery({
    queryKey: ['recent-articles'],
    queryFn: () => analyticsApi.getRecentArticles().then(r => r.data.data),
    enabled: canSeeAnalytics
  });

  const { data: myArticlesData } = useQuery({
    queryKey: ['my-articles-dashboard'],
    queryFn: () => articleApi.getMy({ limit: 5 }).then(r => r.data.data),
    enabled: ['author', 'admin'].includes(role)
  });

  const { data: pubArticles, isLoading: loadingPub } = useQuery({
    queryKey: ['published-articles-dashboard'],
    queryFn: () => articleApi.getAll({ status: 'approved', limit: 6 }).then(r => r.data.data),
    enabled: !canSeeAnalytics
  });

  const articles = analyticsData;
  const recent = recentData || pubArticles?.articles || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening in your knowledge base</p>
        </div>
        {['admin', 'author'].includes(role) && (
          <Link to="/articles/create" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <PlusIcon className="w-4 h-4" />
            New Article
          </Link>
        )}
      </div>

      {/* Stats */}
      {canSeeAnalytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Articles" value={articles?.articles?.total} icon={DocumentTextIcon} color="bg-indigo-600" />
          <StatCard label="Published" value={articles?.articles?.approved} icon={CheckCircleIcon} color="bg-green-600" />
          <StatCard label="Pending Review" value={articles?.articles?.pending} icon={ClockIcon} color="bg-amber-500" />
          <StatCard label="Active Users" value={articles?.users} icon={UsersIcon} color="bg-purple-600" />
        </div>
      )}

      {/* Quick links for non-admin */}
      {!canSeeAnalytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Link to="/articles" className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all group">
            <DocumentTextIcon className="w-8 h-8 text-indigo-600 mb-2" />
            <p className="font-semibold text-gray-900 group-hover:text-indigo-600">Browse Articles</p>
            <p className="text-xs text-gray-500">Find knowledge resources</p>
          </Link>
          <Link to="/search" className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all group">
            <svg className="w-8 h-8 text-indigo-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <p className="font-semibold text-gray-900 group-hover:text-indigo-600">Search</p>
            <p className="text-xs text-gray-500">Full-text search</p>
          </Link>
          <Link to="/bookmarks" className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 transition-all group">
            <BookmarkIcon className="w-8 h-8 text-indigo-600 mb-2" />
            <p className="font-semibold text-gray-900 group-hover:text-indigo-600">Bookmarks</p>
            <p className="text-xs text-gray-500">Saved articles</p>
          </Link>
        </div>
      )}

      {/* My Articles */}
      {myArticlesData?.articles?.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Recent Articles</h2>
            <Link to="/articles/my" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
              View all <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myArticlesData.articles.slice(0, 3).map(a => <ArticleCard key={a.id} article={a} showStatus />)}
          </div>
        </div>
      )}

      {/* Recent Articles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recently Published</h2>
          <Link to="/articles" className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View all <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
        {(loadingRecent || loadingPub) ? (
          <PageLoader />
        ) : recent.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No articles published yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.slice(0, 6).map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </div>
    </div>
  );
}
