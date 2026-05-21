import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../services/api';
import Modal from '../components/ui/Modal';
import { PageLoader } from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import { PlusIcon, PencilIcon, TrashIcon, FolderIcon } from '@heroicons/react/24/outline';

const ICONS = ['folder', 'document', 'users', 'computer-desktop', 'server', 'academic-cap', 'currency-dollar', 'cog-6-tooth', 'shield-check', 'user-plus', 'book-open', 'briefcase'];

function CategoryForm({ initial, categories, onSave, onCancel }) {
  const [form, setForm] = useState({ name: initial?.name || '', description: initial?.description || '', parent_id: initial?.parent_id || '', icon: initial?.icon || 'folder' });
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Category name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" placeholder="Optional description" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Parent Category</label>
        <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <option value="">None (top-level)</option>
          {categories?.filter(c => !initial || c.id !== initial.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="flex gap-3 justify-end pt-2">
        <button onClick={onCancel} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600">Cancel</button>
        <button onClick={() => form.name.trim() && onSave(form)} disabled={!form.name.trim()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm disabled:opacity-50">Save</button>
      </div>
    </div>
  );
}

function CategoryRow({ cat, depth = 0, onEdit, onDelete }) {
  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-3">
          <div className="flex items-center gap-2" style={{ paddingLeft: depth * 20 }}>
            {depth > 0 && <span className="text-gray-300">└</span>}
            <FolderIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900">{cat.name}</span>
          </div>
        </td>
        <td className="px-6 py-3 text-sm text-gray-500 max-w-xs truncate">{cat.description || '—'}</td>
        <td className="px-6 py-3 text-sm text-gray-500">{cat.slug}</td>
        <td className="px-6 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(cat)} className="p-1.5 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"><PencilIcon className="w-4 h-4" /></button>
            <button onClick={() => onDelete(cat)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"><TrashIcon className="w-4 h-4" /></button>
          </div>
        </td>
      </tr>
      {cat.children?.map(child => <CategoryRow key={child.id} cat={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} />)}
    </>
  );
}

export default function CategoryManagementPage() {
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const qc = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll().then(r => r.data.data)
  });

  const { data: flatCategories } = useQuery({
    queryKey: ['categories-flat'],
    queryFn: () => categoryApi.getAll({ flat: true }).then(r => r.data.data)
  });

  const createMutation = useMutation({
    mutationFn: (data) => categoryApi.create(data),
    onSuccess: () => { qc.invalidateQueries(['categories', 'categories-flat']); setModal(null); toast.success('Category created'); }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => categoryApi.update(editing.id, data),
    onSuccess: () => { qc.invalidateQueries(['categories', 'categories-flat']); setModal(null); setEditing(null); toast.success('Category updated'); }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryApi.remove(id),
    onSuccess: () => { qc.invalidateQueries(['categories', 'categories-flat']); toast.success('Category deleted'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Cannot delete category')
  });

  const handleDelete = (cat) => {
    if (window.confirm(`Delete "${cat.name}"?`)) deleteMutation.mutate(cat.id);
  };

  const openEdit = (cat) => { setEditing(cat); setModal('edit'); };

  // Flatten tree for display
  const flattenTree = (nodes, depth = 0) => nodes.flatMap(n => [{ ...n, _depth: depth }, ...(n.children ? flattenTree(n.children, depth + 1) : [])]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-500 text-sm mt-1">Organize articles with hierarchical categories</p>
        </div>
        <button onClick={() => { setEditing(null); setModal('create'); }} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <PlusIcon className="w-4 h-4" />
          New Category
        </button>
      </div>

      {isLoading ? <PageLoader /> : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories?.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">No categories yet</td></tr>
              ) : (
                categories?.map(cat => <CategoryRow key={cat.id} cat={cat} onEdit={openEdit} onDelete={handleDelete} />)
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modal === 'create'} onClose={() => setModal(null)} title="Create Category">
        <CategoryForm categories={flatCategories} onSave={(data) => createMutation.mutate(data)} onCancel={() => setModal(null)} />
      </Modal>

      <Modal open={modal === 'edit'} onClose={() => { setModal(null); setEditing(null); }} title="Edit Category">
        {editing && <CategoryForm initial={editing} categories={flatCategories} onSave={(data) => updateMutation.mutate(data)} onCancel={() => { setModal(null); setEditing(null); }} />}
      </Modal>
    </div>
  );
}
