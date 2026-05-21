import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const getPages = () => {
    const arr = [];
    const delta = 2;
    for (let i = Math.max(2, page - delta); i <= Math.min(pages - 1, page + delta); i++) arr.push(i);
    if (page - delta > 2) arr.unshift('...');
    if (page + delta < pages - 1) arr.push('...');
    arr.unshift(1);
    if (pages > 1) arr.push(pages);
    return [...new Set(arr)];
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={`e-${i}`} className="px-3 py-1.5 text-gray-400 text-sm">...</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'border border-gray-200 hover:bg-gray-50 text-gray-700'}`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onPageChange(page + 1)} disabled={page === pages} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
