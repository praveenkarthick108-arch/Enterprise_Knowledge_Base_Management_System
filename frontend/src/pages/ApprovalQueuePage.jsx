import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { approvalApi } from '../services/api';
import { StatusBadge, TagBadge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircleIcon, XCircleIcon, EyeIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';

export default function ApprovalQueuePage() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null);
  const [comment, setComment] = useState('');
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['approval-queue', page],
    queryFn: () => approvalApi.getQueue({ page, limit: 12 }).then(r => r.data.data),
    keepPreviousData: true
  });

  const approveMutation = useMutation({
    mutationFn: () => approvalApi.approve(selected.id, comment),
    onSuccess: () => { qc.invalidateQueries(['approval-queue']); setSelected(null); setComment(''); toast.success('Article approved and published!'); }
  });

  const rejectMutation = useMutation({
    mutationFn: () => approvalApi.reject(selected.id, comment),
    onSuccess: () => { qc.invalidateQueries(['approval-queue']); setSelected(null); setComment(''); toast.success('Article rejected'); }
  });

  const openModal = (article, act) => { setSelected(article); setAction(act); setComment(''); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approval Queue</h1>
        <p className="text-gray-500 text-sm mt-1">Review and approve submitted articles</p>
      </div>

      {isLoading ? <PageLoader /> : (
        <>
          {data?.articles?.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <ClipboardDocumentCheckIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No articles pending review</p>
              <p className="text-gray-400 text-sm mt-1">All caught up! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">{data?.pagination?.total} article{data?.pagination?.total !== 1 ? 's' : ''} awaiting review</p>
              {data?.articles?.map(article => (
                <div key={article.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusBadge status={article.status} />
                        {article.category && <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{article.category.name}</span>}
                      </div>
                      <Link to={`/articles/${article.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
                        {article.title}
                      </Link>
                      {article.excerpt && <p className="text-sm text-gray-500 line-clamp-2 mt-1">{article.excerpt}</p>}

                      {article.Tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {article.Tags.map(t => <TagBadge key={t.id} name={t.name} color={t.color} />)}
                        </div>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span>by <span className="text-gray-600 font-medium">{article.author?.name}</span></span>
                        <span>submitted {formatDistanceToNow(new Date(article.updated_at), { addSuffix: true })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Link to={`/articles/${article.id}`} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors" title="View article">
                        <EyeIcon className="w-4 h-4" />
                      </Link>
                      <button onClick={() => openModal(article, 'approve')} className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                        <CheckCircleIcon className="w-4 h-4" />
                        Approve
                      </button>
                      <button onClick={() => openModal(article, 'reject')} className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                        <XCircleIcon className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <Pagination page={page} pages={data?.pagination?.pages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={action === 'approve' ? 'Approve Article' : 'Reject Article'}>
        {selected && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium text-gray-900 text-sm">{selected.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">by {selected.author?.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {action === 'approve' ? 'Approval comment (optional)' : 'Rejection reason *'}
              </label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={4}
                placeholder={action === 'approve' ? 'Great article! Well documented...' : 'Please describe what needs to be improved...'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setSelected(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancel</button>
              <button
                onClick={() => action === 'approve' ? approveMutation.mutate() : (comment.trim() && rejectMutation.mutate())}
                disabled={action === 'reject' && !comment.trim()}
                className={`px-4 py-2 text-white rounded-lg text-sm transition-colors disabled:opacity-50 ${action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {action === 'approve' ? 'Approve & Publish' : 'Reject Article'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
