import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { articleApi, categoryApi, tagApi } from '../services/api';
import ArticleEditor from '../components/articles/ArticleEditor';
import { PageLoader } from '../components/ui/Spinner';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

export default function ArticleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: () => articleApi.getOne(id).then(r => r.data.data)
  });

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll({ flat: true }).then(r => r.data.data) });
  const { data: tagsData } = useQuery({ queryKey: ['tags'], queryFn: () => tagApi.getAll().then(r => r.data.data) });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (article) {
      setContent(article.content || '');
      reset({
        title: article.title,
        category_id: article.category_id || '',
        tags: article.Tags?.map(t => t.id.toString()) || []
      });
    }
  }, [article, reset]);

  if (isLoading) return <PageLoader />;
  if (!article) return <div className="text-center py-20 text-gray-400">Article not found</div>;

  // Permission check
  const userRole = user?.role?.name;
  if (article.author_id !== user?.id && userRole !== 'admin') {
    navigate(`/articles/${id}`);
    return null;
  }

  const onSave = handleSubmit(async (data) => {
    if (!content || content === '<p></p>') return toast.error('Content is required');
    setSaving(true);
    try {
      const tagIds = data.tags ? (Array.isArray(data.tags) ? data.tags : [data.tags]).map(Number).filter(Boolean) : [];
      await articleApi.update(id, { title: data.title, content, category_id: data.category_id || null, tags: tagIds });
      toast.success('Article updated successfully');
      navigate(`/articles/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
        <p className="text-gray-500 text-sm mt-1">Update your article content and metadata</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
          <input {...register('title', { required: 'Title is required' })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select {...register('category_id')} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">No category</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
            <select {...register('tags')} multiple className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 h-24">
              {tagsData?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Content</label>
          {content !== undefined && <ArticleEditor content={content} onChange={setContent} />}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={() => navigate(`/articles/${id}`)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button onClick={onSave} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
          {saving && <Spinner size="sm" />}
          Save Changes
        </button>
      </div>
    </div>
  );
}
