import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { Upload, Trash2, Image, Grid3X3, List, Search, Star, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function MediaPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [products, setProducts] = useState([]);
  const fileRef = useRef();

  const loadProducts = async () => {
    try {
      const res = await api.get('/products', { params: { limit: 100 } });
      setProducts(res.data.data || []);
      return res.data.data || [];
    } catch { return []; }
  };

  const load = async () => {
    setLoading(true);
    try {
      const prods = await loadProducts();
      const allMedia = [];
      for (const p of prods) {
        if (p.media?.length) {
          p.media.forEach(m => allMedia.push({ ...m, product_name: p.name, product_id: p.id }));
        }
      }
      setMedia(allMedia);
    } catch { toast.error('Failed to load media'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (!selectedProduct) { toast.error('Select a product first'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('files', f));
      fd.append('file_type', 'image');
      await api.post(`/products/${selectedProduct}/media`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`${files.length} file(s) uploaded`);
      load();
    } catch { toast.error('Upload failed'); }
    setUploading(false);
    e.target.value = '';
  };

  const handleDelete = async (mediaId, productId) => {
    if (!confirm('Delete this image?')) return;
    try {
      await api.delete(`/products/${productId}/media/${mediaId}`);
      toast.success('Deleted');
      setMedia(m => m.filter(i => i.id !== mediaId));
      if (preview?.id === mediaId) setPreview(null);
    } catch { toast.error('Delete failed'); }
  };

  const filtered = media.filter(m =>
    (!search || m.product_name?.toLowerCase().includes(search.toLowerCase()) || m.alt_text?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <Topbar title="Media library" subtitle={`${media.length} files`}
        actions={
          <div className="flex items-center gap-2">
            <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
              className="input-field text-xs py-1.5 w-48">
              <option value="">Select product to upload</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={() => fileRef.current.click()} disabled={uploading}
              className="btn-gold flex items-center gap-1.5 text-xs">
              <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
          </div>
        } />

      <div className="flex-1 overflow-y-auto p-5">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by product name…" className="input-field pl-9 py-2" />
          </div>
          <div className="flex gap-1 ml-auto">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-ink-100 dark:bg-ink-700' : ''}`}><Grid3X3 size={15} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-ink-100 dark:bg-ink-700' : ''}`}><List size={15} /></button>
          </div>
        </div>

        {loading ? <p className="text-ink-400 text-sm">Loading…</p>
        : filtered.length === 0 ? (
          <div className="card text-center py-16">
            <Image size={32} className="mx-auto text-ink-300 mb-3" />
            <p className="text-ink-400 text-sm mb-1">No media files yet</p>
            <p className="text-ink-300 text-xs">Select a product above then click Upload</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map(m => (
              <div key={m.id} className="group relative bg-ink-100 dark:bg-ink-800 rounded-xl overflow-hidden aspect-square cursor-pointer"
                onClick={() => setPreview(m)}>
                <img src={m.thumb_url || m.file_url} alt={m.alt_text || ''} className="w-full h-full object-cover" />
                {m.is_primary && <span className="absolute top-1.5 left-1.5 bg-gold-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-medium">Primary</span>}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <p className="text-white text-[10px] truncate">{m.product_name}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            {filtered.map((m, i) => (
              <div key={m.id} className={`flex items-center gap-3 py-3 ${i < filtered.length - 1 ? 'border-b border-ink-100 dark:border-ink-800' : ''}`}>
                <img src={m.thumb_url || m.file_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-ink-100" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-700 dark:text-ink-200 truncate">{m.product_name}</p>
                  <p className="text-xs text-ink-400 truncate">{m.alt_text || m.file_type}</p>
                </div>
                {m.is_primary && <span className="text-[10px] text-gold-600 font-medium bg-gold-50 dark:bg-gold-900/20 px-2 py-0.5 rounded-full">Primary</span>}
                <div className="flex gap-1">
                  <a href={m.file_url} target="_blank" rel="noreferrer" className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400"><Download size={13} /></a>
                  <button onClick={() => handleDelete(m.id, m.product_id)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
          <div className="bg-white dark:bg-ink-900 rounded-2xl max-w-2xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-ink-200 dark:border-ink-700">
              <div>
                <p className="font-medium text-sm text-ink-700 dark:text-ink-200">{preview.product_name}</p>
                <p className="text-xs text-ink-400">{preview.file_type} · {preview.alt_text || 'No alt text'}</p>
              </div>
              <div className="flex gap-2">
                <a href={preview.file_url} target="_blank" rel="noreferrer" className="btn-ghost text-xs flex items-center gap-1"><Download size={12} /> Open</a>
                <button onClick={() => { handleDelete(preview.id, preview.product_id); setPreview(null); }} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100">Delete</button>
                <button onClick={() => setPreview(null)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16} /></button>
              </div>
            </div>
            <img src={preview.file_url} alt={preview.alt_text} className="w-full max-h-96 object-contain bg-ink-50 dark:bg-ink-950" />
          </div>
        </div>
      )}
    </>
  );
}
