import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookmarkApi } from '../services/api';
import ArticleCard from '../components/articles/ArticleCard';
import Pagination from '../components/ui/Pagination';
import { PageLoader } from '../components/ui/Spinner';
import { BookmarkIcon } from '@heroicons/react/24/outline';

export default function BookmarksPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarks', page],
    queryFn: () => bookmarkApi.getAll({ page, limit: 12 }).then(r => r.data.data),
    keepPreviousData: true
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookmarks</h1>
        <p className="text-gray-500 text-sm mt-1">Your saved articles for quick access</p>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          {data?.bookmarks?.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <BookmarkIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No bookmarks yet</p>
              <p className="text-gray-400 text-sm mt-1">Click the bookmark icon on any article to save it here</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">{data?.pagination?.total} bookmarked article{data?.pagination?.total !== 1 ? 's' : ''}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.bookmarks?.map(b => b.Article && <ArticleCard key={b.id} article={b.Article} />)}
              </div>
              <Pagination page={page} pages={data?.pagination?.pages} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </div>
  );
}
