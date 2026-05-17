import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { Plus, Search, Edit2, Trash2, Eye, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const STATUS_COLORS = { draft:'bg-ink-100 text-ink-500', published:'bg-green-50 text-green-600', archived:'bg-red-50 text-red-500' };
const CATEGORIES = ['Education','Buying guide','News','Gemstone spotlight','Diamond guide','Jewellery care','Behind the scenes','Collection stories'];

const empty = { title:'', slug:'', excerpt:'', content:'', cover_image:'', status:'draft', category:'', tags:'', seo_title:'', seo_description:'' };

export default function BlogPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [posts, setPosts]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading]= useState(true);
  const [modal, setModal]   = useState(null); // null | 'new' | post_object
  const [form, setForm]     = useState(empty);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try { const r=await api.get('/blog',{params:{search:search||undefined,status:statusFilter||undefined}}); setPosts(r.data.data?.data||[]); setTotal(r.data.data?.total||0); }
    catch { setPosts([]); }
    setLoading(false);
  };
  useEffect(()=>{ load(); },[search,statusFilter]);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const openNew  = () => { setForm(empty); setModal('new'); };
  const openEdit = async(post) => {
    try { const r=await api.get(`/blog/${post.id}`); setForm({...r.data.data, tags:Array.isArray(r.data.data.tags)?r.data.data.tags.join(', '):''}); setModal(post); }
    catch { toast.error('Failed to load post'); }
  };

  const handleSave = async(e) => {
    e.preventDefault(); setSaving(true);
    try {
      const data={...form, tags:form.tags?form.tags.split(',').map(t=>t.trim()).filter(Boolean):[]};
      if(!data.slug && data.title) data.slug=data.title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
      if(modal==='new') { await api.post('/blog',data); toast.success('Post created'); }
      else { await api.patch(`/blog/${modal.id}`,data); toast.success('Post updated'); }
      setModal(null); load();
    } catch(e) { toast.error(e.response?.data?.message||'Save failed'); }
    setSaving(false);
  };

  const handleDelete = async(id,title) => {
    if(!confirm(`Delete "${title}"?`)) return;
    try { await api.delete(`/blog/${id}`); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  const lbl='block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';
  const inp='input-field';

  return (
    <>
      <Topbar title="Blog & content" subtitle={`${total} posts`}
        actions={<button onClick={openNew} className="btn-gold flex items-center gap-1.5 text-xs"><Plus size={14}/>New post</button>}/>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-sm"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search posts…" className="input-field pl-9 py-2"/></div>
          {['','draft','published','archived'].map(s=><button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${statusFilter===s?'bg-gold-500 text-white border-gold-500':'border-ink-200 dark:border-ink-700 text-ink-500'}`}>{s||'All'}</button>)}
        </div>

        {loading ? <p className="text-sm text-ink-400 p-4">Loading…</p>
        : posts.length===0 ? (
          <div className="card p-12 text-center"><p className="text-sm text-ink-400 mb-3">No blog posts yet</p><button onClick={openNew} className="btn-gold text-xs">Write first post</button></div>
        ) : (
          <div className="card">
            {posts.map((p,i)=>(
              <div key={p.id} className={`flex items-start gap-4 px-4 py-4 ${i%2===0?'':'bg-ink-50/30 dark:bg-ink-800/10'} ${i<posts.length-1?'border-b border-ink-100 dark:border-ink-800':''}`}>
                {p.cover_image && <img src={p.cover_image} alt={p.title} className="w-16 h-12 rounded-lg object-cover bg-ink-100 flex-shrink-0"/>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]||'bg-ink-100 text-ink-500'}`}>{p.status}</span>
                    {p.category && <span className="text-[10px] text-ink-400 bg-ink-100 dark:bg-ink-800 px-2 py-0.5 rounded">{p.category}</span>}
                  </div>
                  <p className="text-sm font-medium text-ink-700 dark:text-ink-200 truncate">{p.title}</p>
                  <p className="text-xs text-ink-400 truncate mt-0.5">{p.excerpt||'No excerpt'}</p>
                  <p className="text-[10px] text-ink-300 mt-1">By {p.author_name||'—'} · {new Date(p.created_at).toLocaleDateString('en-AE',{day:'numeric',month:'short',year:'numeric'})}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={()=>openEdit(p)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400"><Edit2 size={13}/></button>
                  <button onClick={()=>handleDelete(p.id,p.title)} className="p-1.5 rounded hover:bg-red-50 text-ink-400 hover:text-red-500"><Trash2 size={13}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={()=>setModal(null)}>
          <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">{modal==='new'?'New post':'Edit post'}</h3>
              <button onClick={()=>setModal(null)} className="p-1 rounded hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16}/></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div><label className={lbl}>Title *</label><input value={form.title} onChange={e=>set('title',e.target.value)} required className={inp} placeholder="e.g. The 4Cs of Diamonds Explained"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>Category</label><select value={form.category} onChange={e=>set('category',e.target.value)} className={inp}><option value="">Select…</option>{CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
                <div><label className={lbl}>Status</label><select value={form.status} onChange={e=>set('status',e.target.value)} className={inp}>{['draft','published','archived'].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div><label className={lbl}>Cover image URL</label><input value={form.cover_image} onChange={e=>set('cover_image',e.target.value)} className={inp} placeholder="https://... (upload to media library first)"/></div>
              <div><label className={lbl}>Excerpt</label><textarea value={form.excerpt} onChange={e=>set('excerpt',e.target.value)} className={inp} rows={2} placeholder="Short summary shown on blog listing"/></div>
              <div><label className={lbl}>Content (HTML or Markdown)</label><textarea value={form.content} onChange={e=>set('content',e.target.value)} className={`${inp} font-mono text-xs`} rows={8} placeholder="<p>Write your post here...</p>"/></div>
              <div><label className={lbl}>Tags (comma separated)</label><input value={form.tags} onChange={e=>set('tags',e.target.value)} className={inp} placeholder="diamonds, 4cs, buying guide"/></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className={lbl}>SEO title</label><input value={form.seo_title} onChange={e=>set('seo_title',e.target.value)} className={inp} placeholder="SEO page title"/></div>
                <div><label className={lbl}>SEO description</label><input value={form.seo_description} onChange={e=>set('seo_description',e.target.value)} className={inp} placeholder="Meta description"/></div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-ink-100 dark:border-ink-800">
                <button type="button" onClick={()=>setModal(null)} className="btn-ghost text-xs">Cancel</button>
                <button type="submit" disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
                  {saving?<span className="w-3 h-3 border border-t-transparent border-black/30 rounded-full animate-spin"/>:<Save size={13}/>}
                  {modal==='new'?'Publish post':'Update post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
