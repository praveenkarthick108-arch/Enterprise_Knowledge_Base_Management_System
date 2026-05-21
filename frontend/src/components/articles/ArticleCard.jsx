import { Link } from 'react-router-dom';
import { EyeIcon, StarIcon, ChatBubbleLeftIcon, BookmarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import { StatusBadge, TagBadge } from '../ui/Badge';
import { formatDistanceToNow } from 'date-fns';

export default function ArticleCard({ article, showStatus = false }) {
  const date = article.published_at || article.created_at;

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all duration-200 overflow-hidden group">
      <div className="p-5">
        {/* Category + Status */}
        <div className="flex items-center justify-between mb-2">
          {article.category && (
            <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-md">
              {article.category.name}
            </span>
          )}
          {showStatus && <StatusBadge status={article.status} />}
        </div>

        {/* Title */}
        <Link to={`/articles/${article.id}`}>
          <h3 className="font-semibold text-gray-900 text-base leading-snug mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.excerpt}</p>
        )}

        {/* Tags */}
        {article.Tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {article.Tags.slice(0, 3).map(tag => <TagBadge key={tag.id} name={tag.name} color={tag.color} />)}
            {article.Tags.length > 3 && <span className="text-xs text-gray-400">+{article.Tags.length - 3}</span>}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-semibold">
              {article.author?.name?.charAt(0)}
            </div>
            <span className="text-xs text-gray-500">{article.author?.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><EyeIcon className="w-3.5 h-3.5" />{article.view_count}</span>
            {date && <span className="flex items-center gap-1"><ClockIcon className="w-3.5 h-3.5" />{formatDistanceToNow(new Date(date), { addSuffix: true })}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
