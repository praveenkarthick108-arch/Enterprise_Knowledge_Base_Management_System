import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import {
  getReportingSummary,
  getEtlStatus,
  getTopArticles,
  getCategoryTrends,
  getSearchKeywords,
  getAuthorActivity,
  getEtlHistory,
  triggerEtlRun,
} from '../services/api';

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6'];

// ─── small helpers ────────────────────────────────────────────────────────────

function StatCard({ title, value, sub, color = 'indigo' }) {
  const ring = {
    indigo: 'border-indigo-500 bg-indigo-50',
    purple: 'border-purple-500 bg-purple-50',
    emerald:'border-emerald-500 bg-emerald-50',
    amber:  'border-amber-500 bg-amber-50',
    rose:   'border-rose-500 bg-rose-50',
    sky:    'border-sky-500 bg-sky-50',
  }[color] ?? 'border-indigo-500 bg-indigo-50';

  return (
    <div className={`rounded-xl border-l-4 p-5 shadow-sm ${ring}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{title}</p>
      <p className="mt-1 text-3xl font-bold text-gray-800">{value ?? '–'}</p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

function SectionCard({ title, children, action }) {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h2 className="text-base font-semibold text-gray-700">{title}</h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    success: 'bg-emerald-100 text-emerald-700',
    failed:  'bg-red-100 text-red-700',
    running: 'bg-amber-100 text-amber-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function EmptyState({ message = 'No data yet. Run the ETL pipeline to populate this section.' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <svg className="mb-3 h-10 w-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 17v-2m3 2v-4m3 4v-6M5 20h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Custom truncated X-axis tick ────────────────────────────────────────────
function ShortTick({ x, y, payload }) {
  const label = payload.value.length > 18 ? payload.value.slice(0, 16) + '…' : payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={12} textAnchor="end" fill="#6b7280" fontSize={11}
        transform="rotate(-35)">{label}</text>
    </g>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ReportingDashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role?.name === 'admin';
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('overview');

  const summaryQ  = useQuery({ queryKey: ['reporting-summary'],  queryFn: getReportingSummary,  staleTime: 30_000 });
  const statusQ   = useQuery({ queryKey: ['etl-status'],         queryFn: getEtlStatus,         staleTime: 15_000 });
  const articlesQ = useQuery({ queryKey: ['top-articles'],       queryFn: () => getTopArticles(20) });
  const catQ      = useQuery({ queryKey: ['category-trends'],    queryFn: getCategoryTrends });
  const kwQ       = useQuery({ queryKey: ['search-keywords'],    queryFn: () => getSearchKeywords(25) });
  const authorQ   = useQuery({ queryKey: ['author-activity'],    queryFn: getAuthorActivity });
  const historyQ  = useQuery({ queryKey: ['etl-history'],        queryFn: () => getEtlHistory(10) });

  const triggerMut = useMutation({
    mutationFn: triggerEtlRun,
    onSuccess: () => {
      toast.success('ETL pipeline triggered! Data will refresh in a few seconds.');
      setTimeout(() => {
        queryClient.invalidateQueries();
      }, 6000);
    },
    onError: (err) => toast.error(err?.response?.data?.message || 'Failed to trigger ETL'),
  });

  const summary = summaryQ.data?.data ?? {};
  const etlStatus = statusQ.data?.data ?? {};
  const topArticles = (articlesQ.data?.data ?? []).map(a => ({
    ...a,
    shortTitle: a.article_title?.length > 30 ? a.article_title.slice(0, 28) + '…' : a.article_title,
  }));
  const categoryData = catQ.data?.data ?? [];
  const keywords = kwQ.data?.data ?? [];
  const authors = authorQ.data?.data ?? [];
  const history = historyQ.data?.data ?? [];

  const tabs = [
    { id: 'overview',   label: 'Overview' },
    { id: 'articles',   label: 'Top Articles' },
    { id: 'categories', label: 'Category Trends' },
    { id: 'keywords',   label: 'Search Keywords' },
    { id: 'authors',    label: 'Author Activity' },
    { id: 'etl',        label: 'ETL History' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-8">
      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reporting Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            ETL-powered analytics &amp; insights &mdash; Phase 2
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* ETL status pill */}
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm">
            <span className={`h-2 w-2 rounded-full ${etlStatus.latestRun?.status === 'success' ? 'bg-emerald-500' : etlStatus.latestRun ? 'bg-red-500' : 'bg-gray-300'}`} />
            <span className="text-gray-600">
              {etlStatus.latestRun
                ? `Last run: ${format(new Date(etlStatus.latestRun.run_date), 'MMM d, HH:mm')}`
                : 'No ETL run yet'}
            </span>
          </div>

          {isAdmin && (
            <button
              onClick={() => triggerMut.mutate()}
              disabled={triggerMut.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
            >
              {triggerMut.isPending ? (
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1018.364 5" />
                </svg>
              )}
              Run ETL Now
            </button>
          )}
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        <StatCard title="Articles Indexed" value={summary.articleCount ?? 0} color="indigo" />
        <StatCard title="Categories"       value={summary.categoryCount ?? 0} color="purple" />
        <StatCard title="Total Views"      value={(summary.totalViews ?? 0).toLocaleString()} color="emerald" />
        <StatCard title="Search Keywords"  value={summary.keywordCount ?? 0} color="amber" />
        <StatCard title="Active Authors"   value={summary.authorCount ?? 0} color="sky" />
        <StatCard title="Avg Engagement"   value={summary.avgEngagementScore ?? '0.00'} sub="weighted score" color="rose" />
      </div>

      {/* ── Tabs ── */}
      <div className="mb-5 border-b border-gray-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ══════════════════ TAB PANELS ══════════════════ */}

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top 10 articles by engagement */}
          <SectionCard title="Top 10 Articles by Engagement Score">
            {topArticles.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={topArticles.slice(0, 10)} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="shortTitle" type="category" width={160} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [v, 'Engagement Score']} />
                  <Bar dataKey="engagement_score" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* Category distribution pie */}
          <SectionCard title="Category Distribution">
            {categoryData.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} dataKey="article_count" nameKey="category_name"
                    cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* Top search keywords bar */}
          <SectionCard title="Top Search Keywords">
            {keywords.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={keywords.slice(0, 15)} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="keyword" tick={<ShortTick />} interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="search_count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* Author activity mini table */}
          <SectionCard title="Author Activity Summary">
            {authors.length === 0 ? <EmptyState /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="pb-2 pr-3">Author</th>
                      <th className="pb-2 pr-3 text-right">Articles</th>
                      <th className="pb-2 pr-3 text-right">Views</th>
                      <th className="pb-2 text-right">Avg ★</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {authors.slice(0, 8).map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="py-2 pr-3 font-medium text-gray-800">{a.author_name}</td>
                        <td className="py-2 pr-3 text-right text-gray-600">{a.total_articles}</td>
                        <td className="py-2 pr-3 text-right text-gray-600">{a.total_views.toLocaleString()}</td>
                        <td className="py-2 text-right text-gray-600">{Number(a.avg_rating).toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* TOP ARTICLES */}
      {activeTab === 'articles' && (
        <SectionCard title={`Top ${topArticles.length} Articles by Engagement Score`}>
          {topArticles.length === 0 ? <EmptyState /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">Title</th>
                    <th className="pb-3 pr-4">Category</th>
                    <th className="pb-3 pr-4 text-right">Views</th>
                    <th className="pb-3 pr-4 text-right">Avg ★</th>
                    <th className="pb-3 pr-4 text-right">Comments</th>
                    <th className="pb-3 pr-4 text-right">Bookmarks</th>
                    <th className="pb-3 text-right">Engagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {topArticles.map((a, i) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-4 text-gray-400">{i + 1}</td>
                      <td className="py-2.5 pr-4 font-medium text-gray-800 max-w-xs truncate">{a.article_title}</td>
                      <td className="py-2.5 pr-4">
                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                          {a.category_name}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-right text-gray-600">{Number(a.view_count).toLocaleString()}</td>
                      <td className="py-2.5 pr-4 text-right text-gray-600">{Number(a.avg_rating).toFixed(1)}</td>
                      <td className="py-2.5 pr-4 text-right text-gray-600">{a.comment_count}</td>
                      <td className="py-2.5 pr-4 text-right text-gray-600">{a.bookmark_count}</td>
                      <td className="py-2.5 text-right font-semibold text-indigo-600">{Number(a.engagement_score).toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {/* CATEGORY TRENDS */}
      {activeTab === 'categories' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Total Views by Category">
            {categoryData.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={categoryData} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category_name" tick={<ShortTick />} interval={0} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="total_views" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Views" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Articles per Category">
            {categoryData.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={categoryData} dataKey="article_count" nameKey="category_name"
                    cx="50%" cy="50%" outerRadius={110}
                    label={({ name, value }) => `${name}: ${value}`}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Category Details" >
            {categoryData.length === 0 ? <EmptyState /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="pb-2 pr-4">Category</th>
                      <th className="pb-2 pr-4 text-right">Articles</th>
                      <th className="pb-2 pr-4 text-right">Total Views</th>
                      <th className="pb-2 pr-4 text-right">Avg Views</th>
                      <th className="pb-2 pr-4 text-right">Avg ★</th>
                      <th className="pb-2 text-right">Bookmarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {categoryData.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="py-2 pr-4 font-medium text-gray-800">{c.category_name}</td>
                        <td className="py-2 pr-4 text-right text-gray-600">{c.article_count}</td>
                        <td className="py-2 pr-4 text-right text-gray-600">{Number(c.total_views).toLocaleString()}</td>
                        <td className="py-2 pr-4 text-right text-gray-600">{Number(c.avg_views_per_article).toFixed(0)}</td>
                        <td className="py-2 pr-4 text-right text-gray-600">{Number(c.avg_rating).toFixed(1)}</td>
                        <td className="py-2 text-right text-gray-600">{c.total_bookmarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* SEARCH KEYWORDS */}
      {activeTab === 'keywords' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Top 25 Search Keywords (Bar Chart)">
            {keywords.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={keywords} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="keyword" type="category" width={130} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => [v, 'Searches']} />
                  <Bar dataKey="search_count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Keyword Frequency Table">
            {keywords.length === 0 ? <EmptyState /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="pb-2 pr-4">#</th>
                      <th className="pb-2 pr-4">Keyword</th>
                      <th className="pb-2 text-right">Searches</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {keywords.map((k, i) => (
                      <tr key={k.id} className="hover:bg-gray-50">
                        <td className="py-2 pr-4 text-gray-400">{i + 1}</td>
                        <td className="py-2 pr-4">
                          <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                            {k.keyword}
                          </span>
                        </td>
                        <td className="py-2 text-right font-semibold text-gray-700">{k.search_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* AUTHOR ACTIVITY */}
      {activeTab === 'authors' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title="Author Views Comparison">
            {authors.length === 0 ? <EmptyState /> : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={authors}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="author_name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total_views"    fill="#6366f1" name="Total Views"     radius={[4,4,0,0]} />
                  <Bar dataKey="total_articles" fill="#10b981" name="Total Articles"  radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          <SectionCard title="Author Productivity Table">
            {authors.length === 0 ? <EmptyState /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="pb-2 pr-3">Author</th>
                      <th className="pb-2 pr-3 text-right">Total</th>
                      <th className="pb-2 pr-3 text-right">Published</th>
                      <th className="pb-2 pr-3 text-right">Drafts</th>
                      <th className="pb-2 pr-3 text-right">Views</th>
                      <th className="pb-2 pr-3 text-right">Avg ★</th>
                      <th className="pb-2 text-right">Bookmarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {authors.map((a) => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="py-2.5 pr-3 font-medium text-gray-800">{a.author_name}</td>
                        <td className="py-2.5 pr-3 text-right text-gray-600">{a.total_articles}</td>
                        <td className="py-2.5 pr-3 text-right">
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            {a.published_articles}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-right text-gray-500">{a.draft_articles}</td>
                        <td className="py-2.5 pr-3 text-right text-gray-600">{Number(a.total_views).toLocaleString()}</td>
                        <td className="py-2.5 pr-3 text-right text-gray-600">{Number(a.avg_rating).toFixed(1)}</td>
                        <td className="py-2.5 text-right text-gray-600">{a.total_bookmarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* ETL HISTORY */}
      {activeTab === 'etl' && (
        <SectionCard
          title="ETL Run History"
          action={isAdmin && (
            <button
              onClick={() => triggerMut.mutate()}
              disabled={triggerMut.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              Run ETL Now
            </button>
          )}
        >
          {history.length === 0 ? (
            <EmptyState message="No ETL runs found. Click 'Run ETL Now' to start the pipeline." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    <th className="pb-2 pr-4">Run Date</th>
                    <th className="pb-2 pr-4">Status</th>
                    <th className="pb-2 pr-4 text-right">Extracted</th>
                    <th className="pb-2 pr-4 text-right">Transformed</th>
                    <th className="pb-2 pr-4 text-right">Loaded</th>
                    <th className="pb-2 pr-4 text-right">Duration (s)</th>
                    <th className="pb-2">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50">
                      <td className="py-2.5 pr-4 text-gray-600 whitespace-nowrap">
                        {format(new Date(h.run_date), 'MMM d, yyyy HH:mm')}
                      </td>
                      <td className="py-2.5 pr-4"><StatusBadge status={h.status} /></td>
                      <td className="py-2.5 pr-4 text-right text-gray-600">{h.records_extracted}</td>
                      <td className="py-2.5 pr-4 text-right text-gray-600">{h.records_transformed}</td>
                      <td className="py-2.5 pr-4 text-right font-medium text-gray-800">{h.records_loaded}</td>
                      <td className="py-2.5 pr-4 text-right text-gray-600">{Number(h.duration_seconds).toFixed(2)}</td>
                      <td className="py-2.5 text-xs text-red-500 max-w-xs truncate">{h.error_message ?? '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
