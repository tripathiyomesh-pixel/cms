/**
 * VANTIX-CMS Admin — Pages Management
 * Lists all pages with status, allows create / publish / archive / delete
 * Links to the GrapesJS builder for editing
 */
import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { Plus, Edit2, Trash2, Globe, EyeOff, Archive,
         ExternalLink, RefreshCw, CheckCircle, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const STATUS_CONFIG = {
  published: { label: 'Published', icon: Globe,      color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
  draft:     { label: 'Draft',     icon: Clock,      color: 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400' },
  archived:  { label: 'Archived',  icon: Archive,    color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400' },
};

export default function PagesAdminPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const navigate = useNavigate();

  const [pages,   setPages]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [form,    setForm]    = useState({ title: '', slug: '' });
  const [saving,  setSaving]  = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/pages');
      setPages(r.data.data || []);
    } catch { setPages([]); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (slug, status) => {
    try {
      await api.patch(`/pages/${slug}/publish`, { status });
      toast.success(`Page ${status}`);
      load();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const deletePage = async (slug, isBuiltin) => {
    if (isBuiltin) return toast.error('Built-in pages cannot be deleted');
    if (!confirm('Delete this page? This cannot be undone.')) return;
    try {
      await api.delete(`/pages/${slug}`);
      toast.success('Page deleted');
      load();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
  };

  const createPage = async () => {
    if (!form.title || !form.slug) return toast.error('Title and slug are required');
    setSaving(true);
    try {
      await api.post('/pages', form);
      toast.success('Page created');
      setModal(false);
      setForm({ title: '', slug: '' });
      load();
    } catch (e) { toast.error(e.response?.data?.error || 'Failed'); }
    setSaving(false);
  };

  // Auto-generate slug from title
  const handleTitleChange = (v) => {
    const slug = v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setForm(f => ({ ...f, title: v, slug }));
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Topbar title="Pages" subtitle={`${pages.length} pages`}
        collapsed={collapsed} toggleSidebar={toggleSidebar}
        actions={
          <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2 text-xs">
            <Plus size={13}/> New Page
          </button>
        }
      />

      <div className="flex-1 p-6">
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 dark:border-ink-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide">Page</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide w-28">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-ink-400 uppercase tracking-wide w-32">Last updated</th>
                <th className="px-4 py-3 w-36"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(7).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-ink-100 dark:border-ink-800">
                    {Array(4).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-ink-100 dark:bg-ink-800 rounded animate-pulse"/></td>
                    ))}
                  </tr>
                ))
              ) : pages.map(page => {
                const sc = STATUS_CONFIG[page.status] || STATUS_CONFIG.draft;
                const Icon = sc.icon;
                return (
                  <tr key={page.id} className="border-b border-ink-100 dark:border-ink-800 hover:bg-ink-50/50 dark:hover:bg-ink-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-ink-100 dark:bg-ink-800 flex items-center justify-center">
                          <FileText size={14} className="text-ink-400"/>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-ink-700 dark:text-ink-200">{page.title}</p>
                          <p className="text-[10px] text-ink-400 font-mono">/{page.slug}</p>
                        </div>
                        {page.is_builtin && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-ink-100 dark:bg-ink-800 text-ink-400 rounded-full">built-in</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${sc.color}`}>
                        <Icon size={10}/> {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-400">
                      {page.updated_at ? new Date(page.updated_at).toLocaleDateString('en-AE', { day:'numeric', month:'short' }) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {/* Edit in builder */}
                        <button onClick={() => navigate(`/page-builder?slug=${page.slug}`)}
                          title="Edit in builder"
                          className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400 hover:text-ink-600 transition-colors">
                          <Edit2 size={13}/>
                        </button>

                        {/* Preview */}
                        <a href={`${import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3011'}/${page.slug}`}
                          target="_blank" rel="noreferrer" title="Preview"
                          className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400 hover:text-ink-600 transition-colors">
                          <ExternalLink size={13}/>
                        </a>

                        {/* Publish / Unpublish */}
                        {page.status !== 'published' ? (
                          <button onClick={() => setStatus(page.slug, 'published')}
                            title="Publish" className="p-1.5 rounded hover:bg-green-50 dark:hover:bg-green-900/20 text-ink-400 hover:text-green-600 transition-colors">
                            <CheckCircle size={13}/>
                          </button>
                        ) : (
                          <button onClick={() => setStatus(page.slug, 'draft')}
                            title="Unpublish" className="p-1.5 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 text-ink-400 hover:text-amber-600 transition-colors">
                            <EyeOff size={13}/>
                          </button>
                        )}

                        {/* Delete */}
                        {!page.is_builtin && (
                          <button onClick={() => deletePage(page.slug, page.is_builtin)}
                            title="Delete" className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-base font-semibold text-ink-800 dark:text-ink-100 mb-5">Create New Page</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Page Title <span className="text-red-500">*</span></label>
                <input value={form.title} onChange={e => handleTitleChange(e.target.value)}
                  placeholder="e.g. About Our Story" className="input w-full"/>
              </div>
              <div>
                <label className="label">Slug <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-0 border border-ink-200 dark:border-ink-700 rounded-lg overflow-hidden">
                  <span className="bg-ink-50 dark:bg-ink-800 px-3 py-2 text-xs text-ink-400 border-r border-ink-200 dark:border-ink-700 font-mono">/</span>
                  <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-transparent focus:outline-none text-ink-700 dark:text-ink-200" placeholder="about-our-story"/>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setModal(false)} className="btn-ghost">Cancel</button>
              <button onClick={createPage} disabled={saving} className="btn-primary">
                {saving ? 'Creating…' : 'Create Page'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
