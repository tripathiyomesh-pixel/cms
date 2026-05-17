import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { categoriesAPI } from '../services/api';
import { Plus, Edit2, Trash2, FolderTree, ChevronRight, ChevronDown, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

function CategoryNode({ cat, level = 0, onEdit, onDelete }) {
  const [open, setOpen] = useState(true);
  const hasChildren = cat.children?.length > 0;

  return (
    <div>
      <div className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-ink-50 dark:hover:bg-ink-800 group transition-colors`}
        style={{ paddingLeft: `${level * 24 + 12}px` }}>
        <button onClick={() => setOpen(!open)} className="w-5 h-5 flex items-center justify-center text-ink-400 flex-shrink-0">
          {hasChildren ? (open ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : <span className="w-1.5 h-1.5 rounded-full bg-ink-300" />}
        </button>
        <div className="flex-1 min-w-0">
          <span className="text-sm text-ink-700 dark:text-ink-200 font-medium">{cat.name}</span>
          <span className="text-[10px] text-ink-400 ml-2">/{cat.slug}</span>
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(cat)} className="p-1 rounded hover:bg-ink-200 dark:hover:bg-ink-700 text-ink-400"><Edit2 size={12} /></button>
          <button onClick={() => onDelete(cat)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500"><Trash2 size={12} /></button>
        </div>
      </div>
      {hasChildren && open && cat.children.map(child => (
        <CategoryNode key={child.id} cat={child} level={level + 1} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default function CategoriesPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [tree, setTree] = useState([]);
  const [flatList, setFlatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [treeRes, listRes] = await Promise.all([categoriesAPI.tree(), categoriesAPI.list()]);
      setTree(treeRes.data.data || []);
      setFlatList(listRes.data.data || []);
    } catch { toast.error('Failed to load categories'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (cat) => {
    if (!confirm(`Delete "${cat.name}"? Children will be moved up.`)) return;
    try {
      await categoriesAPI.delete(cat.id);
      toast.success('Category deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <>
      <Topbar title="Categories" subtitle={`${flatList.length} categories`}
        actions={
          <button onClick={() => setModal('new')} className="btn-gold flex items-center gap-1.5 text-xs">
            <Plus size={14} /> Add category
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-5">
        <div className="card max-w-2xl">
          <div className="px-4 py-3 border-b border-ink-200/60 dark:border-ink-700">
            <span className="text-sm font-medium text-ink-700 dark:text-ink-200">Category tree</span>
          </div>
          <div className="p-2">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
              </div>
            ) : tree.length === 0 ? (
              <div className="text-center py-12">
                <FolderTree size={28} className="text-ink-300 mx-auto mb-3" />
                <p className="text-xs text-ink-400 mb-3">No categories yet</p>
                <button onClick={() => setModal('new')} className="btn-gold text-xs">Create first category</button>
              </div>
            ) : tree.map(cat => (
              <CategoryNode key={cat.id} cat={cat} onEdit={c => setModal(c)} onDelete={handleDelete} />
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <CategoryModal
          data={modal === 'new' ? null : modal}
          parents={flatList}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </>
  );
}

function CategoryModal({ data, parents, onClose, onSave }) {
  const isEdit = !!data;
  const [form, setForm] = useState({
    name: data?.name || '', description: data?.description || '',
    parent_id: data?.parent_id || '', sort_order: data?.sort_order || 0,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (isEdit) await categoriesAPI.update(data.id, form);
      else await categoriesAPI.create(form);
      toast.success(isEdit ? 'Category updated' : 'Category created');
      onSave();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
          <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">{isEdit ? 'Edit category' : 'New category'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5">Category name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className="input-field" required placeholder="Rings" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5">Parent category</label>
            <select value={form.parent_id} onChange={e => set('parent_id', e.target.value || null)} className="input-field">
              <option value="">None (top level)</option>
              {parents.filter(p => p.id !== data?.id).map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input-field min-h-[60px]" placeholder="Optional description" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-outline text-xs">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs disabled:opacity-50">
              <Save size={13} /> {saving ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
