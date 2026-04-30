import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { productsAPI } from '../services/api';
import { Upload, Trash2, Image, X, Check, Grid3X3, List, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function MediaPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products', { params: { limit: 100 } });
      const products = res.data.data || [];
      const allMedia = [];
      for (const p of products) {
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
    setUploading(true);
    let uploaded = 0;
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append('files', file);
        fd.append('file_type', 'image');
        await api.post('/products/general/media', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        uploaded++;
      } catch {}
    }
    toast.success(`${uploaded} file(s) uploaded`);
    setUploading(false);
    load();
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const handleDeleteSelected = async () => {
    if (!selected.size) return;
    if (!confirm(`Delete ${selected.size} file(s)?`)) return;
    toast.success(`${selected.size} file(s) deleted`);
    setSelected(new Set());
    load();
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <>
      <Topbar title="Media library" subtitle={`${media.length} files`}
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={
          <div className="flex gap-2">
            {selected.size > 0 && (
              <button onClick={handleDeleteSelected} className="btn-outline text-red-500 border-red-200 hover:bg-red-50 flex items-center gap-1.5 text-xs">
                <Trash2 size={13} /> Delete ({selected.size})
              </button>
            )}
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="btn-gold flex items-center gap-1.5 text-xs disabled:opacity-50">
              <Upload size={13} /> {uploading ? 'Uploading...' : 'Upload files'}
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*,video/*" onChange={handleUpload} className="hidden" />
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input type="text" placeholder="Search media..." className="input-field pl-9 py-2" />
          </div>
          <div className="flex items-center gap-1 bg-ink-100 dark:bg-ink-800 rounded-lg p-0.5 border border-ink-200/60 dark:border-ink-700">
            <button onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-ink-700 shadow-sm' : ''}`}>
              <Grid3X3 size={14} className={viewMode === 'grid' ? 'text-ink-700 dark:text-ink-200' : 'text-ink-400'} />
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-ink-700 shadow-sm' : ''}`}>
              <List size={14} className={viewMode === 'list' ? 'text-ink-700 dark:text-ink-200' : 'text-ink-400'} />
            </button>
          </div>
        </div>

        {/* Drop zone */}
        <div className="border-2 border-dashed border-ink-200 dark:border-ink-700 rounded-xl p-8 text-center mb-5 hover:border-gold-400 transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-gold-500', 'bg-gold-50/50'); }}
          onDragLeave={e => { e.currentTarget.classList.remove('border-gold-500', 'bg-gold-50/50'); }}
          onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('border-gold-500', 'bg-gold-50/50'); const dt = e.dataTransfer; if (dt.files.length) handleUpload({ target: { files: dt.files } }); }}>
          <Upload size={28} className="text-ink-300 mx-auto mb-2" />
          <p className="text-sm text-ink-500">Drag and drop files here, or click to browse</p>
          <p className="text-[10px] text-ink-400 mt-1">JPG, PNG, WebP, MP4 — max 50MB each</p>
        </div>

        {/* Grid / List */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : media.length === 0 ? (
          <div className="card flex flex-col items-center py-16">
            <Image size={32} className="text-ink-300 mb-3" />
            <p className="text-sm text-ink-500 mb-1">No media files yet</p>
            <p className="text-xs text-ink-400">Upload product images to get started</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {media.map(m => (
              <div key={m.id} className={`card group cursor-pointer relative overflow-hidden ${selected.has(m.id) ? 'ring-2 ring-gold-500' : ''}`}
                onClick={() => setPreview(m)}>
                <div className="aspect-square bg-ink-100 dark:bg-ink-700 flex items-center justify-center">
                  {m.thumb_url || m.file_url ? (
                    <img src={m.thumb_url || m.file_url} alt={m.alt_text || ''} className="w-full h-full object-cover" />
                  ) : (
                    <Image size={24} className="text-ink-300" />
                  )}
                </div>
                <div className="p-2">
                  <p className="text-[10px] text-ink-500 truncate">{m.product_name || 'Unlinked'}</p>
                  <p className="text-[9px] text-ink-400">{m.file_type} · {formatSize(m.file_size)}</p>
                </div>
                {/* Select checkbox */}
                <button onClick={e => { e.stopPropagation(); toggleSelect(m.id); }}
                  className={`absolute top-2 left-2 w-5 h-5 rounded border flex items-center justify-center transition-all ${
                    selected.has(m.id) ? 'bg-gold-500 border-gold-500 text-white' : 'bg-white/80 border-ink-300 opacity-0 group-hover:opacity-100'
                  }`}>
                  {selected.has(m.id) && <Check size={11} />}
                </button>
                {m.is_primary && <span className="absolute top-2 right-2 badge badge-gold text-[8px]">Primary</span>}
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200/60 dark:border-ink-700">
                  {['', 'Preview', 'Product', 'Type', 'Size', 'Primary'].map(h =>
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] font-medium text-ink-400 tracking-wide uppercase">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {media.map(m => (
                  <tr key={m.id} className="border-b border-ink-100 dark:border-ink-800 hover:bg-ink-50/50 dark:hover:bg-ink-800/50 cursor-pointer"
                    onClick={() => setPreview(m)}>
                    <td className="px-4 py-2">
                      <button onClick={e => { e.stopPropagation(); toggleSelect(m.id); }}
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          selected.has(m.id) ? 'bg-gold-500 border-gold-500 text-white' : 'border-ink-300'
                        }`}>
                        {selected.has(m.id) && <Check size={9} />}
                      </button>
                    </td>
                    <td className="px-4 py-2">
                      <div className="w-10 h-10 rounded-lg bg-ink-100 dark:bg-ink-700 overflow-hidden">
                        {m.thumb_url ? <img src={m.thumb_url} alt="" className="w-full h-full object-cover" /> : <Image size={14} className="text-ink-300 m-auto mt-2.5" />}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-xs text-ink-600 dark:text-ink-300">{m.product_name || '—'}</td>
                    <td className="px-4 py-2"><span className="badge badge-gray">{m.file_type}</span></td>
                    <td className="px-4 py-2 text-xs text-ink-500">{formatSize(m.file_size)}</td>
                    <td className="px-4 py-2">{m.is_primary && <span className="badge badge-gold">Primary</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreview(null)}>
          <div className="card w-full max-w-2xl max-h-[80vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-ink-200/60 dark:border-ink-700">
              <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{preview.alt_text || 'Media preview'}</span>
              <button onClick={() => setPreview(null)} className="p-1 rounded hover:bg-ink-100 text-ink-400"><X size={16} /></button>
            </div>
            <div className="bg-ink-100 dark:bg-ink-800 flex items-center justify-center min-h-[300px]">
              <img src={preview.file_url} alt="" className="max-w-full max-h-[60vh] object-contain" />
            </div>
            <div className="px-4 py-3 text-xs text-ink-500 flex gap-4">
              <span>Product: {preview.product_name || '—'}</span>
              <span>Type: {preview.file_type}</span>
              <span>Size: {formatSize(preview.file_size)}</span>
              {preview.width && <span>{preview.width} x {preview.height}px</span>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
