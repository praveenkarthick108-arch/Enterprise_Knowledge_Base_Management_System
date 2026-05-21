import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleApi, commentApi, ratingApi, bookmarkApi, attachmentApi, approvalApi } from '../services/api';
import { StatusBadge, TagBadge } from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import Modal from '../components/ui/Modal';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { formatDistanceToNow, format } from 'date-fns';
import {
  EyeIcon, BookmarkIcon, ShareIcon, PencilIcon, TrashIcon,
  StarIcon, PaperClipIcon, ChatBubbleLeftIcon, ClockIcon,
  CheckCircleIcon, XCircleIcon, PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid, StarIcon as StarSolid } from '@heroicons/react/24/solid';

function StarRating({ current, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => onRate(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          className="transition-colors">
          {s <= (hover || current) ? <StarSolid className="w-5 h-5 text-amber-400" /> : <StarIcon className="w-5 h-5 text-gray-300" />}
        </button>
      ))}
    </div>
  );
}

function CommentItem({ comment, onReply, onDelete, userId, isAdmin }) {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleReply = () => { onReply(comment.id, replyText); setReplyText(''); setReplyOpen(false); };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold flex-shrink-0">
          {comment.author?.name?.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-900">{comment.author?.name}</span>
              <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
            </div>
            <p className="text-sm text-gray-700">{comment.content}</p>
          </div>
          <div className="flex items-center gap-3 mt-1 ml-1">
            <button onClick={() => setReplyOpen(!replyOpen)} className="text-xs text-gray-400 hover:text-indigo-600">Reply</button>
            {(comment.user_id === userId || isAdmin) && (
              <button onClick={() => onDelete(comment.id)} className="text-xs text-gray-400 hover:text-red-500">Delete</button>
            )}
          </div>
          {replyOpen && (
            <div className="mt-2 flex gap-2">
              <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <button onClick={handleReply} disabled={!replyText.trim()} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm disabled:opacity-50">Reply</button>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map(r => (
        <div key={r.id} className="ml-11 flex gap-3">
          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-semibold flex-shrink-0">
            {r.author?.name?.charAt(0)}
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl px-4 py-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-900">{r.author?.name}</span>
              <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</span>
            </div>
            <p className="text-sm text-gray-700">{r.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ArticleViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [comment, setComment] = useState('');
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [reviewComment, setReviewComment] = useState('');

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articleApi.getOne(id).then(r => r.data.data)
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ['comments', id],
    queryFn: () => commentApi.getByArticle(id).then(r => r.data.data),
    enabled: !!article
  });

  const { data: approvalHistory } = useQuery({
    queryKey: ['approval-history', id],
    queryFn: () => approvalApi.getHistory(id).then(r => r.data.data),
    enabled: !!article
  });

  const rateMutation = useMutation({
    mutationFn: (score) => ratingApi.rate(id, score),
    onSuccess: () => { qc.invalidateQueries(['article', id]); toast.success('Rating saved'); }
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => bookmarkApi.toggle(id),
    onSuccess: (res) => { qc.invalidateQueries(['article', id]); toast.success(res.data.data.bookmarked ? 'Bookmarked!' : 'Bookmark removed'); }
  });

  const commentMutation = useMutation({
    mutationFn: (data) => commentApi.create(id, data),
    onSuccess: () => { refetchComments(); setComment(''); toast.success('Comment added'); }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (cid) => commentApi.remove(cid),
    onSuccess: () => { refetchComments(); toast.success('Comment deleted'); }
  });

  const approveMutation = useMutation({
    mutationFn: () => approvalApi.approve(id, reviewComment),
    onSuccess: () => { qc.invalidateQueries(['article', id]); setApproveModal(false); toast.success('Article approved and published!'); }
  });

  const rejectMutation = useMutation({
    mutationFn: () => approvalApi.reject(id, reviewComment),
    onSuccess: () => { qc.invalidateQueries(['article', id]); setRejectModal(false); toast.success('Article rejected'); }
  });

  const handleDelete = async () => {
    if (!window.confirm('Archive this article?')) return;
    try { await articleApi.remove(id); navigate('/articles'); toast.success('Article archived'); } catch (_) { toast.error('Failed'); }
  };

  if (isLoading) return <PageLoader />;
  if (!article) return <div className="text-center py-20 text-gray-400">Article not found</div>;

  const userRole = user?.role?.name;
  const isOwner = article.author_id === user?.id;
  const canEdit = isOwner || userRole === 'admin';
  const canReview = ['admin', 'reviewer'].includes(userRole);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link to="/articles" className="hover:text-indigo-600">Knowledge Base</Link>
        <span>/</span>
        {article.category && <><Link to={`/articles?category_id=${article.category_id}`} className="hover:text-indigo-600">{article.category.name}</Link><span>/</span></>}
        <span className="text-gray-900 truncate">{article.title}</span>
      </div>

      {/* Article Header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-8">
          {/* Status + Category */}
          <div className="flex items-center gap-3 mb-4">
            <StatusBadge status={article.status} />
            {article.category && <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-medium">{article.category.name}</span>}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>

          {/* Tags */}
          {article.Tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.Tags.map(t => <TagBadge key={t.id} name={t.name} color={t.color} />)}
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold">
                {article.author?.name?.charAt(0)}
              </div>
              <span>{article.author?.name}</span>
              {article.author?.department && <span className="text-gray-300">·</span>}
              {article.author?.department && <span className="text-xs text-gray-400">{article.author.department}</span>}
            </div>
            {article.published_at && (
              <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" />{format(new Date(article.published_at), 'MMM d, yyyy')}</span>
            )}
            <span className="flex items-center gap-1"><EyeIcon className="w-4 h-4" />{article.view_count} views</span>
            {article.rating?.count > 0 && (
              <span className="flex items-center gap-1"><StarSolid className="w-4 h-4 text-amber-400" />{article.rating?.avg} ({article.rating?.count})</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <button onClick={() => bookmarkMutation.mutate()} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${article.isBookmarked ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {article.isBookmarked ? <BookmarkSolid className="w-4 h-4" /> : <BookmarkIcon className="w-4 h-4" />}
                {article.isBookmarked ? 'Saved' : 'Bookmark'}
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm transition-colors">
                <ShareIcon className="w-4 h-4" />
                Share
              </button>
            </div>
            <div className="flex items-center gap-2">
              {/* Approval actions */}
              {canReview && article.status === 'pending' && (
                <>
                  <button onClick={() => setApproveModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-colors">
                    <CheckCircleIcon className="w-4 h-4" />Approve
                  </button>
                  <button onClick={() => setRejectModal(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                    <XCircleIcon className="w-4 h-4" />Reject
                  </button>
                </>
              )}
              {/* Submit for approval */}
              {isOwner && ['draft', 'rejected'].includes(article.status) && (
                <button onClick={() => articleApi.submit(id).then(() => { qc.invalidateQueries(['article', id]); toast.success('Submitted for review'); })}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm">
                  <PaperAirplaneIcon className="w-4 h-4" />Submit for Review
                </button>
              )}
              {canEdit && ['draft', 'rejected'].includes(article.status) && (
                <Link to={`/articles/${id}/edit`} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                  <PencilIcon className="w-4 h-4" />Edit
                </Link>
              )}
              {(isOwner || userRole === 'admin') && (
                <button onClick={handleDelete} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Rejection notice */}
        {article.status === 'rejected' && article.rejection_reason && (
          <div className="mx-8 mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm font-medium text-red-700 mb-1">Rejection reason:</p>
            <p className="text-sm text-red-600">{article.rejection_reason}</p>
          </div>
        )}

        {/* Content */}
        <div className="px-8 pb-8">
          <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        {/* Attachments */}
        {article.attachments?.length > 0 && (
          <div className="px-8 pb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <PaperClipIcon className="w-4 h-4" />
              Attachments ({article.attachments.length})
            </h3>
            <div className="space-y-2">
              {article.attachments.map(att => (
                <a key={att.id} href={attachmentApi.download(att.id)} download
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group">
                  <PaperClipIcon className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{att.original_name}</p>
                    <p className="text-xs text-gray-400">{att.mime_type} · {att.file_size ? `${(att.file_size / 1024).toFixed(1)} KB` : ''}</p>
                  </div>
                  <span className="text-xs text-indigo-600 group-hover:text-indigo-800">Download</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Rating */}
        {article.status === 'approved' && (
          <div className="px-8 pb-6 border-t border-gray-100 pt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Rate this article</h3>
            <div className="flex items-center gap-4">
              <StarRating current={article.userRating || 0} onRate={(s) => rateMutation.mutate(s)} />
              {article.rating?.count > 0 && (
                <span className="text-sm text-gray-500">{article.rating.avg}/5 from {article.rating.count} rating{article.rating.count !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Approval History */}
      {approvalHistory?.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Approval History</h3>
          <div className="space-y-3">
            {approvalHistory.map(h => (
              <div key={h.id} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${h.action === 'approved' ? 'bg-green-100' : h.action === 'rejected' ? 'bg-red-100' : 'bg-gray-100'}`}>
                  {h.action === 'approved' ? <CheckCircleIcon className="w-3.5 h-3.5 text-green-600" /> : h.action === 'rejected' ? <XCircleIcon className="w-3.5 h-3.5 text-red-600" /> : <PaperAirplaneIcon className="w-3.5 h-3.5 text-gray-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{h.reviewer?.name}</span>
                    <span className={`text-xs capitalize px-2 py-0.5 rounded-full ${h.action === 'approved' ? 'bg-green-100 text-green-700' : h.action === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>{h.action}</span>
                    <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}</span>
                  </div>
                  {h.comment && <p className="text-sm text-gray-600 mt-0.5">{h.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <ChatBubbleLeftIcon className="w-5 h-5" />
          Comments ({comments?.length || 0})
        </h3>

        {/* Add comment */}
        <div className="flex gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-sm font-semibold flex-shrink-0">
            {user?.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your thoughts or ask a question..."
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
            <div className="flex justify-end mt-2">
              <button onClick={() => comment.trim() && commentMutation.mutate({ content: comment })} disabled={!comment.trim() || commentMutation.isPending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50">
                Post Comment
              </button>
            </div>
          </div>
        </div>

        {/* Comments list */}
        <div className="space-y-4">
          {comments?.map(c => (
            <CommentItem key={c.id} comment={c}
              onReply={(parentId, text) => commentMutation.mutate({ content: text, parent_id: parentId })}
              onDelete={(cid) => deleteCommentMutation.mutate(cid)}
              userId={user?.id}
              isAdmin={userRole === 'admin'}
            />
          ))}
          {comments?.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first to comment!</p>}
        </div>
      </div>

      {/* Approve Modal */}
      <Modal open={approveModal} onClose={() => setApproveModal(false)} title="Approve Article">
        <p className="text-gray-600 text-sm mb-4">Add a comment for the author (optional):</p>
        <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Great article! Ready to publish."
          rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none mb-4" />
        <div className="flex gap-3 justify-end">
          <button onClick={() => setApproveModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancel</button>
          <button onClick={() => approveMutation.mutate()} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">Approve & Publish</button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Reject Article">
        <p className="text-gray-600 text-sm mb-4">Provide a reason for rejection <span className="text-red-500">*</span></p>
        <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Please describe what needs to be improved..."
          rows={4} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none mb-4" />
        <div className="flex gap-3 justify-end">
          <button onClick={() => setRejectModal(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancel</button>
          <button onClick={() => reviewComment.trim() && rejectMutation.mutate()} disabled={!reviewComment.trim()} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:opacity-50">Reject</button>
        </div>
      </Modal>
    </div>
  );
}
