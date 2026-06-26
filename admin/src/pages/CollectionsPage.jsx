import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { collectionsAPI } from '../services/api';
import { Plus, Edit2, Trash2, Layers, X, Save, Star } from 'lucide-react';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import SkeletonLoader from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function CollectionsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await collectionsAPI.list();
      setCollections(res.data.data || []);
    } catch { toast.error('Failed to load collections'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await collectionsAPI.delete(deleteConfirm.id);
      toast.success('Collection deleted');
      setDeleteConfirm(null);
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <>
      <ConfirmDialog
        open={!!deleteConfirm}
        title={`Delete "${deleteConfirm?.name}"?`}
        message="All products in this collection will be unassigned. This cannot be undone."
        confirmLabel="Delete collection"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
      <Topbar title="Collections" subtitle={`${collections.length} collections`}
        actions={
          <button onClick={() => setModal('new')} className="btn-gold flex items-center gap-1.5 text-xs">
            <Plus size={14} /> New collection
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-5">
        {loading ? (
          <SkeletonLoader variant="card" count={6} />
        ) : collections.length === 0 ? (
          <div className="card">
            <EmptyState
              icon="📦"
              title="No collections yet"
              message="Collections group your products into themes like Bridal, Everyday, or Anniversary."
              actionLabel="Create First Collection"
              onAction={() => setModal('new')}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.map(c => (
              <div key={c.id} className="card hover:border-gold-400 transition-colors group">
                <div className="h-32 bg-gradient-to-br from-gold-50 to-ink-100 dark:from-ink-700 dark:to-ink-800 flex items-center justify-center relative">
                  {c.banner_url ? (
                    <img src={c.banner_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Layers size={28} className="text-gold-400/50" />
                  )}
                  {c.is_featured && (
                    <div className="absolute top-2 right-2 badge badge-gold gap-1"><Star size={10} /> Featured</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">{c.name}</h3>
                  <p className="text-[11px] text-ink-400 mt-0.5 line-clamp-2">{c.description || 'No description'}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100 dark:border-ink-700">
                    <span className="text-[11px] text-ink-400">{c.product_count || 0} products</span>
                    <div className="flex gap-1">
                      <button onClick={() => setModal(c)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteConfirm({ id: c.id, name: c.name })} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && <CollectionModal data={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
    </>
  );
}

function CollectionModal({ data, onClose, onSave }) {
  const isEdit = !!data;
  const [form, setForm] = useState({
    name: data?.name || '', description: data?.description || '',
    is_featured: data?.is_featured || false, sort_order: data?.sort_order || 0,
    banner_url: data?.banner_url || '',
    seo_title: data?.seo_title || '', seo_desc: data?.seo_desc || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (isEdit) await collectionsAPI.update(data.id, form);
      else await collectionsAPI.create(form);
      toast.success(isEdit ? 'Collection updated' : 'Collection created');
      onSave();
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
          <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">{isEdit ? 'Edit collection' : 'New collection'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5">Collection name</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} className="input-field" required placeholder="Bridal Collection" />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} className="input-field min-h-[70px]" placeholder="Collection description..." />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5">Banner image URL</label>
            <input value={form.banner_url} onChange={e => set('banner_url', e.target.value)} className="input-field" placeholder="https://..." />
            {form.banner_url && <img src={form.banner_url} alt="" className="mt-2 h-20 w-full object-cover rounded" />}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5">Sort order</label>
              <input type="number" value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} className="input-field" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 text-xs text-ink-600 dark:text-ink-300 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="rounded border-ink-300" />
                Featured collection
              </label>
            </div>
          </div>
          <div className="border-t border-ink-200/60 dark:border-ink-700 pt-4 space-y-3">
            <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wide">SEO</p>
            <div>
              <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5">SEO title</label>
              <input value={form.seo_title} onChange={e => set('seo_title', e.target.value)} className="input-field" placeholder="SEO title for this collection" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5">SEO description (max 160 chars)</label>
              <textarea value={form.seo_desc} onChange={e => set('seo_desc', e.target.value)} maxLength={160} className="input-field" rows={2} placeholder="Meta description for search engines..." />
              <p className="text-[10px] text-ink-400 mt-1">{form.seo_desc.length}/160</p>
            </div>
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
