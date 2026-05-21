import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { articleApi } from '../services/api';
import ArticleCard from '../components/articles/ArticleCard';
import Pagination from '../components/ui/Pagination';
import { PageLoader } from '../components/ui/Spinner';
import { PlusIcon } from '@heroicons/react/24/outline';

const STATUSES = ['', 'draft', 'pending', 'approved', 'rejected', 'archived'];

export default function MyArticlesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['my-articles', page, status],
    queryFn: () => articleApi.getMy({ page, limit: 12, status: status || undefined }).then(r => r.data.data),
    keepPreviousData: true
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Articles</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your knowledge articles</p>
        </div>
        <Link to="/articles/create" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <PlusIcon className="w-4 h-4" />
          New Article
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${status === s ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          {data?.articles?.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-400 text-lg mb-2">No articles found</p>
              <Link to="/articles/create" className="text-indigo-600 text-sm hover:underline">Create your first article →</Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.articles?.map(a => <ArticleCard key={a.id} article={a} showStatus />)}
              </div>
              <Pagination page={page} pages={data?.pagination?.pages} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  );
}
