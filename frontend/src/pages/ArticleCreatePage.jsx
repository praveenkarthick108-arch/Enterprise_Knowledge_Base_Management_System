import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { articleApi, categoryApi, tagApi } from '../services/api';
import ArticleEditor from '../components/articles/ArticleEditor';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';

export default function ArticleCreatePage() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, control, formState: { errors } } = useForm();

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll({ flat: true }).then(r => r.data.data) });
  const { data: tagsData } = useQuery({ queryKey: ['tags'], queryFn: () => tagApi.getAll().then(r => r.data.data) });

  const save = async (data, andSubmit = false) => {
    if (!content || content === '<p></p>') return toast.error('Article content is required');
    try {
      const tagIds = data.tags ? (Array.isArray(data.tags) ? data.tags : [data.tags]).map(Number).filter(Boolean) : [];
      const payload = { title: data.title, content, category_id: data.category_id || null, tags: tagIds };
      const res = await articleApi.create(payload);
      const id = res.data.data.id;
      if (andSubmit) {
        await articleApi.submit(id, 'Ready for review');
        toast.success('Article created and submitted for review!');
      } else {
        toast.success('Article saved as draft');
      }
      navigate(`/articles/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save article');
    }
  };

  const onSaveDraft = handleSubmit(async (data) => { setSaving(true); await save(data, false); setSaving(false); });
  const onSubmit = handleSubmit(async (data) => { setSubmitting(true); await save(data, true); setSubmitting(false); });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Article</h1>
        <p className="text-gray-500 text-sm mt-1">Write and publish knowledge articles for your organization</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-500">*</span></label>
          <input {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'Min 5 characters' } })}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            placeholder="Enter a descriptive article title..." />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select {...register('category_id')} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
              <option value="">Select category...</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.parent_id ? '  └ ' : ''}{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (hold Ctrl to select multiple)</label>
            <select {...register('tags')} multiple className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 h-24">
              {tagsData?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Content <span className="text-red-500">*</span></label>
          <ArticleEditor content={content} onChange={setContent} />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <div className="flex items-center gap-3">
          <button onClick={onSaveDraft} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 border border-indigo-300 text-indigo-600 rounded-lg text-sm hover:bg-indigo-50 transition-colors">
            {saving && <Spinner size="sm" />}
            Save Draft
          </button>
          <button onClick={onSubmit} disabled={submitting} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors">
            {submitting && <Spinner size="sm" />}
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}
