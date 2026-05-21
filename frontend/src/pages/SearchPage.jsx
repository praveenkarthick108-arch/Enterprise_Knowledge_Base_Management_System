import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchApi, categoryApi, tagApi } from '../services/api';
import ArticleCard from '../components/articles/ArticleCard';
import Pagination from '../components/ui/Pagination';
import { PageLoader } from '../components/ui/Spinner';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category_id: searchParams.get('category_id') || '', tag: searchParams.get('tag') || '', sort: 'relevance' });

  const q = searchParams.get('q') || '';

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', q, page, filters],
    queryFn: () => searchApi.search({ q, page, limit: 12, ...filters }).then(r => r.data.data),
    enabled: q.length >= 2,
    keepPreviousData: true
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll({ flat: true }).then(r => r.data.data) });
  const { data: tagsData } = useQuery({ queryKey: ['tags'], queryFn: () => tagApi.getAll().then(r => r.data.data) });

  const { data: trending } = useQuery({ queryKey: ['trending'], queryFn: () => searchApi.trending().then(r => r.data.data) });

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) { setSearchParams({ q: query }); setPage(1); }
  };

  const setFilter = (key, value) => { setFilters(f => ({ ...f, [key]: value })); setPage(1); };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Search Knowledge Base</h1>
        <p className="text-gray-500 text-sm mt-1">Find articles, guides, and documentation</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent shadow-sm"
            placeholder="Search for articles, guides, policies..." />
        </div>
        <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm">
          Search
        </button>
      </form>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        <div className="w-56 flex-shrink-0 space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-semibold text-gray-900 mb-3">Filters</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Category</label>
                <select value={filters.category_id} onChange={e => setFilter('category_id', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">All</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Tag</label>
                <select value={filters.tag} onChange={e => setFilter('tag', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">All</option>
                  {tagsData?.map(t => <option key={t.id} value={t.slug}>{t.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Sort by</label>
                <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="relevance">Relevance</option>
                  <option value="latest">Latest</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
              <button onClick={() => setFilters({ category_id: '', tag: '', sort: 'relevance' })} className="text-xs text-gray-400 hover:text-gray-600">Clear filters</button>
            </div>
          </div>

          {/* Trending */}
          {trending?.length > 0 && !q && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Trending Searches</p>
              <div className="space-y-2">
                {trending.slice(0, 8).map((t, i) => (
                  <button key={i} onClick={() => { setQuery(t.query); setSearchParams({ q: t.query }); }}
                    className="w-full text-left text-xs text-gray-600 hover:text-indigo-600 flex items-center justify-between">
                    <span className="truncate">{t.query}</span>
                    <span className="text-gray-300 ml-2">{t.search_count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 space-y-4">
          {!q ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Enter a search term to find articles</p>
              <p className="text-gray-400 text-sm mt-1">Try searching for policies, guides, or topics</p>
            </div>
          ) : isLoading ? <PageLoader /> : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {data?.pagination?.total || 0} result{data?.pagination?.total !== 1 ? 's' : ''} for "<span className="font-semibold text-gray-900">{q}</span>"
                  {isFetching && <span className="ml-2 text-gray-400">Searching...</span>}
                </p>
              </div>

              {data?.articles?.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                  <MagnifyingGlassIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No results found for "{q}"</p>
                  <p className="text-gray-400 text-sm mt-1">Try different keywords or check spelling</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data?.articles?.map(a => <ArticleCard key={a.id} article={a} />)}
                  </div>
                  <Pagination page={page} pages={data?.pagination?.pages} onPageChange={setPage} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
