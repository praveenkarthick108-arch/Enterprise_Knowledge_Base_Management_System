import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../services/api';
import { PageLoader } from '../components/ui/Spinner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { EyeIcon, DocumentTextIcon, UsersIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center mb-3`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
  </div>
);

export default function AnalyticsPage() {
  const { data: dashboard, isLoading } = useQuery({ queryKey: ['analytics-dashboard'], queryFn: () => analyticsApi.getDashboard().then(r => r.data.data) });
  const { data: popular } = useQuery({ queryKey: ['analytics-popular'], queryFn: () => analyticsApi.getPopularArticles().then(r => r.data.data) });
  const { data: categories } = useQuery({ queryKey: ['analytics-categories'], queryFn: () => analyticsApi.getPopularCategories().then(r => r.data.data) });
  const { data: trends } = useQuery({ queryKey: ['analytics-trends'], queryFn: () => analyticsApi.getSearchTrends().then(r => r.data.data) });
  const { data: activeUsers } = useQuery({ queryKey: ['analytics-users'], queryFn: () => analyticsApi.getActiveUsers().then(r => r.data.data) });

  if (isLoading) return <PageLoader />;

  const articlePieData = dashboard ? [
    { name: 'Approved', value: dashboard.articles.approved },
    { name: 'Pending', value: dashboard.articles.pending },
    { name: 'Draft', value: dashboard.articles.draft },
    { name: 'Rejected', value: dashboard.articles.rejected },
    { name: 'Archived', value: dashboard.articles.archived },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Insights into knowledge base usage and performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Articles" value={dashboard?.articles?.total} icon={DocumentTextIcon} color="bg-indigo-600" />
        <StatCard label="Published" value={dashboard?.articles?.approved} icon={DocumentTextIcon} color="bg-green-600" />
        <StatCard label="Pending Review" value={dashboard?.articles?.pending} icon={DocumentTextIcon} color="bg-amber-500" />
        <StatCard label="Active Users" value={dashboard?.users} icon={UsersIcon} color="bg-purple-600" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Article status pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Article Status Distribution</h3>
          {articlePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={articlePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {articlePieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-10">No data</p>}
        </div>

        {/* Popular categories */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Popular Categories</h3>
          {categories?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categories?.slice(0, 6)} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v, n) => [v, n === 'total_views' ? 'Views' : 'Articles']} />
                <Bar dataKey="article_count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Articles" />
                <Bar dataKey="total_views" fill="#10b981" radius={[0, 4, 4, 0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-400 py-10">No data</p>}
        </div>
      </div>

      {/* Search trends */}
      {trends?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MagnifyingGlassIcon className="w-5 h-5 text-indigo-600" />
            Top Search Queries (Last 30 Days)
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trends.slice(0, 10)}>
              <XAxis dataKey="query" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Searches" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Popular articles */}
      {popular?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Most Viewed Articles</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Article</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Author</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {popular.map((a, i) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-400">{i + 1}</td>
                  <td className="px-6 py-3">
                    <Link to={`/articles/${a.id}`} className="text-sm font-medium text-gray-900 hover:text-indigo-600 line-clamp-1">{a.title}</Link>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{a.category?.name || '—'}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{a.author?.name}</td>
                  <td className="px-6 py-3 text-sm font-semibold text-gray-900 text-right flex items-center justify-end gap-1">
                    <EyeIcon className="w-4 h-4 text-gray-400" />{a.view_count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Active Users */}
      {activeUsers?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Most Active Users (Last 30 Days)</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Articles</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Comments</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activeUsers.slice(0, 10).map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold">{u.name?.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-700 text-right">{u.articles_count}</td>
                  <td className="px-6 py-3 text-sm text-gray-700 text-right">{u.comments_count}</td>
                  <td className="px-6 py-3 text-sm text-gray-700 text-right">{u.views_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
