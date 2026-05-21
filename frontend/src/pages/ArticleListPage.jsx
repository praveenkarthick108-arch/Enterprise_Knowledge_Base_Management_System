import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { articleApi, categoryApi, tagApi } from '../services/api';
import ArticleCard from '../components/articles/ArticleCard';
import Pagination from '../components/ui/Pagination';
import { PageLoader } from '../components/ui/Spinner';
import { PlusIcon, FunnelIcon } from '@heroicons/react/24/outline';
import useAuthStore from '../store/authStore';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popular', label: 'Most Popular' }
];

export default function ArticleListPage() {
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category_id: '', tag: '', sort: 'latest' });
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['articles', page, filters],
    queryFn: () => articleApi.getAll({ page, limit: 12, status: 'approved', ...filters }).then(r => r.data.data),
    keepPreviousData: true
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll({ flat: true }).then(r => r.data.data) });
  const { data: tagsData } = useQuery({ queryKey: ['tags'], queryFn: () => tagApi.getAll().then(r => r.data.data) });

  const setFilter = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setPage(1); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-500 text-sm mt-1">Browse and discover organizational knowledge</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            <FunnelIcon className="w-4 h-4" />
            Filters
          </button>
          {['admin', 'author'].includes(user?.role?.name) && (
            <Link to="/articles/create" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <PlusIcon className="w-4 h-4" />
              New Article
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select value={filters.category_id} onChange={e => setFilter('category_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">All categories</option>
                {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tag</label>
              <select value={filters.tag} onChange={e => setFilter('tag', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="">All tags</option>
                {tagsData?.map(t => <option key={t.id} value={t.slug}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort by</label>
              <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={() => { setFilters({ category_id: '', tag: '', sort: 'latest' }); setPage(1); }} className="text-xs text-gray-500 hover:text-gray-700 mt-3">
            Clear filters
          </button>
        </div>
      )}

      {isLoading ? <PageLoader /> : (
        <>
          {data?.articles?.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No articles found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">{data?.pagination?.total} article{data?.pagination?.total !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.articles?.map(a => <ArticleCard key={a.id} article={a} />)}
              </div>
              <Pagination page={page} pages={data?.pagination?.pages} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  );
}
