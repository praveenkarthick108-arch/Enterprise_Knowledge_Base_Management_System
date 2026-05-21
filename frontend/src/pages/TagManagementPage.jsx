import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tagApi } from '../services/api';
import Modal from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const COLORS = ['#6366f1', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#dc2626'];

function TagForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [color, setColor] = useState(initial?.color || '#6366f1');
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tag Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="e.g. howto, policy, urgent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Color</label>
        <div className="flex items-center gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
          ))}
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border border-gray-200" title="Custom color" />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-white px-2 py-0.5 rounded-md font-medium" style={{ backgroundColor: color }}>#{name || 'preview'}</span>
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancel</button>
        <button onClick={() => name.trim() && onSave({ name: name.trim(), color })} disabled={!name.trim()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm disabled:opacity-50">Save</button>
      </div>
    </div>
  );
}

export default function TagManagementPage() {
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const qc = useQueryClient();

  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => tagApi.getAll().then(r => r.data.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => tagApi.create(data),
    onSuccess: () => { qc.invalidateQueries(['tags']); setModal(null); toast.success('Tag created'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  });

  const updateMutation = useMutation({
    mutationFn: (data) => tagApi.update(editing.id, data),
    onSuccess: () => { qc.invalidateQueries(['tags']); setModal(null); setEditing(null); toast.success('Tag updated'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => tagApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['tags']); toast.success('Tag deleted'); }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tag Management</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage article tags for better discoverability</p>
        </div>
        <button onClick={() => { setEditing(null); setModal('create'); }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <PlusIcon className="w-4 h-4" />
          New Tag
        </button>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tag</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tags?.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">No tags yet</td></tr>
              ) : tags?.map(tag => (
                <tr key={tag.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">
                    <span className="text-xs text-white px-2.5 py-1 rounded-md font-medium" style={{ backgroundColor: tag.color }}>
                      #{tag.name}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">{tag.slug}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">{tag.usage_count || 0} articles</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditing(tag); setModal('edit'); }} className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => window.confirm(`Delete "#${tag.name}"?`) && deleteMutation.mutate(tag.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Create Tag">
        <TagForm onSave={(data) => createMutation.mutate(data)} onCancel={() => setModal(null)} />
      </Modal>

      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setEditing(null); }} title="Edit Tag">
        {editing && <TagForm initial={editing} onSave={(data) => updateMutation.mutate(data)} onCancel={() => { setModal(null); setEditing(null); }} />}
      </Modal>
    </div>
  );
}
