import { useState, useEffect, useRef, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Upload, Trash2, Image, Video, FileText, Grid3X3,
  List, Search, Copy, X, ExternalLink, RefreshCw, Filter,
  CheckSquare, Square, Trash,
} from 'lucide-react';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const TYPE_ICON = { image: Image, video: Video, pdf: FileText };
const TYPE_COLOR = { image:'badge-blue', video:'badge-purple', pdf:'badge-red' };

function MediaCard({ item, onDelete, onCopy, viewMode }) {
  const [hovered, setHovered] = useState(false);
  const isImage = item.file_type === 'image' || item.file_url?.match(/\.(jpg|jpeg|png|webp|gif)/i);
  const isVideo = item.file_type === 'video' || item.file_url?.match(/\.(mp4|mov|webm)/i);

  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 px-4 py-3 border-b border-ink-100 dark:border-ink-800 hover:bg-ink-50/50 dark:hover:bg-ink-800/30 transition-colors group">
        <div className="w-12 h-12 rounded-lg bg-ink-100 dark:bg-ink-700 flex items-center justify-center flex-shrink-0 overflow-hidden border border-ink-200 dark:border-ink-600">
          {isImage
            ? <img src={item.thumb_url || item.file_url} alt={item.alt_text} className="w-full h-full object-cover"/>
            : <Video size={20} className="text-ink-400"/>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-ink-700 dark:text-ink-200 truncate">{item.alt_text || item.cloudinary_id || 'Untitled'}</p>
          <p className="text-[10px] text-ink-400 truncate">{item.product_name || 'General'}</p>
        </div>
        <span className={`badge text-[10px] flex-shrink-0 ${TYPE_COLOR[item.file_type] || 'badge-gray'}`}>
          {item.file_type || 'image'}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onCopy(item.file_url)} title="Copy URL"
            className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400 hover:text-ink-600 transition-colors">
            <Copy size={13}/>
          </button>
          <a href={item.file_url} target="_blank" rel="noreferrer" title="Open"
            className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400 hover:text-ink-600 transition-colors">
            <ExternalLink size={13}/>
          </a>
          <button onClick={() => onDelete(item)} title="Delete"
            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500 transition-colors">
            <Trash2 size={13}/>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-xl overflow-hidden border border-ink-200 dark:border-ink-700 bg-ink-100 dark:bg-ink-800 aspect-square"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {isImage ? (
        <img src={item.thumb_url || item.file_url} alt={item.alt_text || ''}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"/>
      ) : isVideo ? (
        <div className="w-full h-full flex items-center justify-center bg-ink-900">
          <Video size={28} className="text-ink-400"/>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-ink-50 dark:bg-ink-800">
          <FileText size={28} className="text-ink-400"/>
        </div>
      )}

      {/* Overlay */}
      <div className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={() => onCopy(item.file_url)} title="Copy URL"
          className="flex items-center gap-1.5 bg-white/90 text-ink-800 px-3 py-1.5 rounded-lg text-[11px] font-semibold hover:bg-white transition-colors">
          <Copy size={11}/> Copy URL
        </button>
        <div className="flex gap-2">
          <a href={item.file_url} target="_blank" rel="noreferrer"
            className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors">
            <ExternalLink size={13}/>
          </a>
          <button onClick={() => onDelete(item)}
            className="p-2 bg-red-500/80 rounded-lg text-white hover:bg-red-500 transition-colors">
            <Trash2 size={13}/>
          </button>
        </div>
      </div>

      {/* Product label */}
      {item.product_name && (
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-[10px] text-white/80 truncate">{item.product_name}</p>
        </div>
      )}
    </div>
  );
}

export default function MediaPage() {
  const { collapsed } = useOutletContext() || {};
  const [media, setMedia]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch]     = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [products, setProducts] = useState([]);
  const [preview, setPreview]   = useState(null);
  const [stats, setStats]       = useState({ total: 0, images: 0, videos: 0 });
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [folders, setFolders] = useState([]);
  const fileRef = useRef();
  const dropRef = useRef();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [mediaRes, foldersRes, productsRes] = await Promise.all([
        api.get('/media', { params: {
          limit: 96, search: search || undefined,
          file_type: typeFilter || undefined,
          product_id: productFilter || undefined,
        }}),
        api.get('/media/folders').catch(() => ({ data: { data: [] } })),
        api.get('/products', { params: { limit: 200 } }).catch(() => ({ data: { data: [] } })),
      ]);
      setMedia(mediaRes.data.data || []);
      setFolders(foldersRes.data.data || []);
      setProducts(productsRes.data.data || []);
      if (mediaRes.data.stats) {
        setStats({
          total:  parseInt(mediaRes.data.stats.total  || 0),
          images: parseInt(mediaRes.data.stats.images || 0),
          videos: parseInt(mediaRes.data.stats.videos || 0),
        });
      }
    } catch { toast.error('Failed to load media'); }
    setLoading(false);
  }, [search, typeFilter, productFilter]);

  useEffect(() => { load(); }, [load]);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async (files, productId) => {
    if (!files.length) return;
    setUploading(true);
    setProgress(0);
    try {
      const fd = new FormData();
      files.forEach(f => fd.append('files', f));
      const endpoint = productId ? `/products/${productId}/media` : '/media/upload';
      await api.post(endpoint, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: e => setProgress(Math.round((e.loaded / e.total) * 100)),
      });
      toast.success(`${files.length} file(s) uploaded`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
    setProgress(0);
    if (fileRef.current) fileRef.current.value = '';
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (item) => { setDeleteItem(item); };

  const confirmDelete = async () => {
    if (!deleteItem) return;
    try {
      if (deleteItem.product_id) {
        await api.delete(`/products/${deleteItem.product_id}/media/${deleteItem.id}`);
      } else {
        await api.delete(`/media/${deleteItem.id}`);
      }
      toast.success('File deleted');
      setMedia(prev => prev.filter(m => m.id !== deleteItem.id));
      setDeleteItem(null);
    } catch {
      toast.error('Delete failed — try again');
    }
  };

  // ── Bulk delete ───────────────────────────────────────────────────────────
  const handleBulkDelete = () => { setBulkDeleteConfirm(true); };

  const confirmBulkDelete = async () => {
    if (!selectedIds.size) return;
    setBulkDeleting(true);
    setBulkDeleteConfirm(false);
    try {
      await api.post('/media/bulk-delete', { ids: Array.from(selectedIds) });
      toast.success(`${selectedIds.size} file(s) deleted`);
      setSelectedIds(new Set());
      load();
    } catch { toast.error('Bulk delete failed'); }
    setBulkDeleting(false);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === media.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(media.map(m => m.id)));
    }
  };

  // ── Copy URL ──────────────────────────────────────────────────────────────
  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('URL copied to clipboard');
    } catch {
      toast.error('Copy failed');
    }
  };

  // ── Drag and drop ─────────────────────────────────────────────────────────
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length) handleUpload(files, productFilter || null);
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = media.filter(m => {
    if (typeFilter && !(m.file_type === typeFilter || m.file_url?.includes(`.${typeFilter}`))) return false;
    if (productFilter && m.product_id !== productFilter) return false;
    if (search && !m.alt_text?.toLowerCase().includes(search.toLowerCase()) &&
        !m.product_name?.toLowerCase().includes(search.toLowerCase()) &&
        !m.cloudinary_id?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <ConfirmDialog
        open={!!deleteItem}
        title="Delete this file?"
        message="The file will be permanently removed from the media library."
        confirmLabel="Delete file"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteItem(null)}
      />
      <ConfirmDialog
        open={bulkDeleteConfirm}
        title={`Delete ${selectedIds.size} file(s)?`}
        message="These files will be permanently removed. This cannot be undone."
        confirmLabel={`Delete ${selectedIds.size} files`}
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
      <Topbar
        title="Media Library"
        subtitle={`${stats.total} files · ${stats.images} images · ${stats.videos} videos`}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={load} className="btn-ghost text-xs flex items-center gap-1">
              <RefreshCw size={12}/> Refresh
            </button>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="btn-gold flex items-center gap-1.5 text-xs disabled:opacity-50">
              <Upload size={13}/> {uploading ? `Uploading ${progress}%…` : 'Upload files'}
            </button>
          </div>
        }
      />

      <input ref={fileRef} type="file" multiple accept="image/*,video/*"
        className="hidden" onChange={e => handleUpload(Array.from(e.target.files), productFilter)}/>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total files', value: stats.total, color: 'text-ink-700 dark:text-ink-200' },
            { label: 'Images', value: stats.images, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Videos', value: stats.videos, color: 'text-purple-600 dark:text-purple-400' },
          ].map(s => (
            <div key={s.label} className="card p-4">
              <p className="text-[10px] text-ink-400 uppercase tracking-wide mb-1">{s.label}</p>
              <p className={`text-2xl font-500 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Upload drop zone */}
        <div
          ref={dropRef}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gold-300 dark:border-gold-700 hover:border-gold-400 rounded-xl p-6 text-center transition-colors cursor-pointer"
          onClick={() => fileRef.current?.click()}>
          <Upload size={24} className="mx-auto text-ink-300 mb-2"/>
          <p className="text-xs text-ink-500">
            {productFilter
              ? <>Drop or click to upload to <strong className="text-ink-700 dark:text-ink-200">{products.find(p => p.id === productFilter)?.name}</strong></>
              : 'Drop files here or click to upload to the general library'}
          </p>
          {uploading && (
            <div className="mt-3 max-w-xs mx-auto">
              <div className="h-1.5 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
                <div className="h-full bg-gold-500 rounded-full transition-all duration-300" style={{ width:`${progress}%` }}/>
              </div>
              <p className="text-[10px] text-ink-400 mt-1">{progress}% uploaded</p>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search files…" className="input-field pl-8 py-1.5 text-xs"/>
          </div>

          <select value={productFilter} onChange={e => setProductFilter(e.target.value)}
            className="input-field py-1.5 text-xs flex-1 min-w-[180px] max-w-[240px]">
            <option value="">All products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>

          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="input-field py-1.5 text-xs w-28">
            <option value="">All types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>

          <div className="flex gap-1 border border-ink-200 dark:border-ink-700 rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode==='grid' ? 'bg-ink-100 dark:bg-ink-700 text-ink-700 dark:text-ink-200' : 'text-ink-400'}`}>
              <Grid3X3 size={14}/>
            </button>
            <button onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode==='list' ? 'bg-ink-100 dark:bg-ink-700 text-ink-700 dark:text-ink-200' : 'text-ink-400'}`}>
              <List size={14}/>
            </button>
          </div>

          <span className="text-[11px] text-ink-400 ml-auto">{filtered.length} files</span>

          {/* Bulk selection controls */}
          <button onClick={selectAll}
            className="btn-ghost flex items-center gap-1.5 text-xs py-1.5"
            title={selectedIds.size === media.length ? 'Deselect all' : 'Select all'}>
            {selectedIds.size === media.length && media.length > 0
              ? <CheckSquare size={13} className="text-gold-500"/>
              : <Square size={13}/>}
            {selectedIds.size > 0 ? `${selectedIds.size} selected` : 'Select'}
          </button>

          {selectedIds.size > 0 && (
            <button onClick={handleBulkDelete} disabled={bulkDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors">
              {bulkDeleting ? <RefreshCw size={12} className="animate-spin"/> : <Trash size={12}/>}
              Delete {selectedIds.size}
            </button>
          )}
        </div>

        {/* Media grid / list */}
        {loading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {Array(12).fill(0).map((_,i) => (
                <div key={i} className="aspect-square rounded-xl bg-ink-100 dark:bg-ink-800 animate-pulse"/>
              ))}
            </div>
          ) : (
            <div className="card divide-y divide-ink-100 dark:divide-ink-800">
              {Array(8).fill(0).map((_,i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-12 h-12 rounded-lg bg-ink-100 dark:bg-ink-800 animate-pulse"/>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded animate-pulse w-1/2"/>
                    <div className="h-2 bg-ink-100 dark:bg-ink-800 rounded animate-pulse w-1/3"/>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <Image size={32} className="mx-auto text-ink-200 mb-3"/>
            <p className="text-ink-400 text-xs">
              {media.length === 0 ? 'No media uploaded yet. Select a product and upload files.' : 'No files match your filters.'}
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {filtered.map(item => (
              <MediaCard key={item.id} item={item} viewMode="grid"
                onDelete={handleDelete} onCopy={copyUrl}/>
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden">
            {filtered.map(item => (
              <MediaCard key={item.id} item={item} viewMode="list"
                onDelete={handleDelete} onCopy={copyUrl}/>
            ))}
          </div>
        )}
      </div>

      {/* Preview lightbox */}
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
          onClick={() => setPreview(null)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
            <X size={20}/>
          </button>
          <img src={preview} alt="" className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()}/>
        </div>
      )}
    </>
  );
}
