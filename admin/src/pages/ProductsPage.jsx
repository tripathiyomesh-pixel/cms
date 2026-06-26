import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import StatusBadge from '../components/ui/StatusBadge';
import { productsAPI } from '../services/api';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  Plus, Search, ChevronLeft, ChevronRight, Trash2, Edit2,
  Gem, Star, Sparkles, Tag, CheckSquare, Square, Package,
  TrendingUp, FlaskConical, ShoppingBag, MoreHorizontal,
} from 'lucide-react';

const METAL_COLORS = {
  gold:'badge-gold', silver:'badge-gray', platinum:'badge-blue',
  rose_gold:'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  white_gold:'badge-gray', palladium:'badge-gray',
};
const STATUS_COLORS = {
  active:'badge-green', draft:'badge-gray',
  inactive:'badge-red', archived:'badge-gray', sold:'badge-red',
};

// Flag badge component
function FlagBadge({ label, icon: Icon, color }) {
  return (
    <span className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${color}`}>
      {Icon && <Icon size={8}/>} {label}
    </span>
  );
}

export default function ProductsPage() {
  const { collapsed } = useOutletContext() || {};
  const navigate = useNavigate();
  const [products, setProducts]     = useState([]);
  const [pagination, setPagination] = useState({ total:0, page:1, limit:15, pages:1 });
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [categories, setCategories] = useState([]);
  const [filters, setFilters]       = useState({ metal_type:'', status:'', category_id:'', is_featured:'', sort:'created_at', order:'DESC' });
  const [selected, setSelected]     = useState(new Set());
  const [bulkAction, setBulkAction] = useState('');
  const [bulking, setBulking]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, name }

  // Load categories for filter
  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data || [])).catch(()=>{});
  }, []);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setSelected(new Set());
    try {
      const params = { page, limit: pagination.limit, ...filters };
      if (search.trim()) params.search = search.trim();
      // Remove empty filters
      Object.keys(params).forEach(k => { if (params[k] === '') delete params[k]; });
      const res = await productsAPI.list(params);
      setProducts(res.data.data || []);
      setPagination(res.data.pagination || { total:0, page:1, limit:15, pages:1 });
    } catch { toast.error('Failed to load products'); }
    setLoading(false);
  }, [filters, search, pagination.limit]);

  useEffect(() => { load(1); }, [filters]);

  const handleSearch = (e) => { e.preventDefault(); load(1); };

  // ── Quick status toggle ───────────────────────────────────────────────────
  const quickPatch = async (id, updates, label) => {
    try {
      await api.patch(`/products/${id}/status`, updates);
      toast.success(label);
      load(pagination.page);
    } catch { toast.error('Update failed'); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await productsAPI.delete(deleteConfirm.id);
      toast.success('Product deleted');
      setDeleteConfirm(null);
      load(pagination.page);
    } catch { toast.error('Delete failed'); }
  };

  // ── Bulk actions ──────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelected(prev => prev.size === products.length ? new Set() : new Set(products.map(p => p.id)));
  };
  const runBulk = async () => {
    if (!bulkAction || selected.size === 0) return;
    setBulking(true);
    try {
      await api.post('/products/bulk-status', { ids: Array.from(selected), status: bulkAction });
      toast.success(`${selected.size} products updated`);
      setBulkAction('');
      load(pagination.page);
    } catch { toast.error('Bulk action failed'); }
    setBulking(false);
  };

  const allSelected = products.length > 0 && selected.size === products.length;
  const someSelected = selected.size > 0;

  return (
    <>
      <ConfirmDialog
        open={!!deleteConfirm}
        title={`Delete "${deleteConfirm?.name}"?`}
        message="This action cannot be undone. The product will be permanently removed."
        confirmLabel="Delete product"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
      <Topbar
        title="Products"
        subtitle={`${pagination.total || 0} total`}
        actions={
          <button onClick={() => navigate('/products/new')} className="btn-gold flex items-center gap-1.5 text-xs">
            <Plus size={14}/> Add product
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto p-5 space-y-4">

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="relative flex-1 min-w-[180px] max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"/>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, SKU…" className="input-field pl-8 py-1.5 text-xs"/>
          </form>

          {/* Category filter */}
          <select value={filters.category_id} onChange={e => setFilters(f=>({...f, category_id:e.target.value}))}
            className="input-field py-1.5 text-xs w-36">
            <option value="">All categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {/* Metal filter */}
          <select value={filters.metal_type} onChange={e => setFilters(f=>({...f, metal_type:e.target.value}))}
            className="input-field py-1.5 text-xs w-32">
            <option value="">All metals</option>
            {['gold','silver','platinum','rose_gold','white_gold'].map(m =>
              <option key={m} value={m}>{m.replace('_',' ')}</option>)}
          </select>

          {/* Status filter */}
          <select value={filters.status} onChange={e => setFilters(f=>({...f, status:e.target.value}))}
            className="input-field py-1.5 text-xs w-28">
            <option value="">All status</option>
            {['active','draft','inactive','archived'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Featured filter */}
          <select value={filters.is_featured} onChange={e => setFilters(f=>({...f, is_featured:e.target.value}))}
            className="input-field py-1.5 text-xs w-28">
            <option value="">All types</option>
            <option value="true">Featured only</option>
          </select>
        </div>

        {/* ── Bulk actions bar ── */}
        {someSelected && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 rounded-xl">
            <span className="text-xs font-semibold text-gold-700 dark:text-gold-400">
              {selected.size} selected
            </span>
            <select value={bulkAction} onChange={e => setBulkAction(e.target.value)}
              className="input-field py-1 text-xs w-32">
              <option value="">Bulk action</option>
              <option value="active">Set active</option>
              <option value="draft">Set draft</option>
              <option value="inactive">Set inactive</option>
              <option value="archived">Archive</option>
            </select>
            <button onClick={runBulk} disabled={!bulkAction || bulking}
              className="btn-gold text-xs py-1 px-3 disabled:opacity-40">
              {bulking ? 'Applying…' : 'Apply'}
            </button>
            <button onClick={() => setSelected(new Set())} className="text-xs text-ink-400 hover:text-ink-600 ml-auto">
              Clear
            </button>
          </div>
        )}

        {/* ── Table ── */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-ink-200/60 dark:border-ink-700 bg-ink-50/60 dark:bg-ink-800/40">
                  <th className="px-3 py-3 w-8">
                    <button onClick={toggleAll} className="text-ink-400 hover:text-gold-500 transition-colors">
                      {allSelected ? <CheckSquare size={15}/> : <Square size={15}/>}
                    </button>
                  </th>
                  {['Product','SKU','Metal','Weight','Price','Status','Flags',''].map(h => (
                    <th key={h} className="text-left px-3 py-3 text-[10px] font-semibold text-ink-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_,i) => (
                    <tr key={i} className="border-b border-ink-100 dark:border-ink-800">
                      {Array(8).fill(0).map((_,j) => (
                        <td key={j} className="px-3 py-3">
                          <div className="h-4 bg-ink-100 dark:bg-ink-800 rounded animate-pulse"/>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16">
                      <Package size={28} className="mx-auto text-ink-200 mb-3"/>
                      <p className="text-ink-400 text-xs mb-3">No products found</p>
                      <button onClick={() => navigate('/products/new')} className="btn-gold text-xs">
                        Add first product
                      </button>
                    </td>
                  </tr>
                ) : products.map(p => {
                  const isSel = selected.has(p.id);
                  return (
                    <tr key={p.id}
                      className={`border-b border-ink-100 dark:border-ink-800 transition-colors cursor-pointer
                        ${isSel ? 'bg-gold-50/50 dark:bg-gold-900/10' : 'hover:bg-ink-50/50 dark:hover:bg-ink-800/30'}`}
                      onClick={() => navigate(`/products/${p.id}`)}>

                      {/* Checkbox */}
                      <td className="px-3 py-3 w-8" onClick={e => { e.stopPropagation(); toggleSelect(p.id); }}>
                        <button className="text-ink-400 hover:text-gold-500 transition-colors">
                          {isSel ? <CheckSquare size={14} className="text-gold-500"/> : <Square size={14}/>}
                        </button>
                      </td>

                      {/* Product */}
                      <td className="px-3 py-3 min-w-[200px]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-ink-100 dark:bg-ink-700 flex items-center justify-center flex-shrink-0 overflow-hidden border border-ink-200 dark:border-ink-600">
                            {p.media?.[0]?.thumb_url
                              ? <img src={p.media[0].thumb_url} alt="" className="w-full h-full object-cover"/>
                              : <Gem size={14} className="text-gold-400"/>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-ink-700 dark:text-ink-200 truncate max-w-[160px]">{p.name}</p>
                            <p className="text-ink-400 truncate text-[10px]">{p.category?.name || '—'}</p>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-3 py-3 text-ink-400 font-mono text-[10px]">{p.sku || '—'}</td>

                      {/* Metal */}
                      <td className="px-3 py-3">
                        <span className={`badge text-[10px] ${METAL_COLORS[p.metal_type] || 'badge-gray'}`}>
                          {p.metal_type?.replace('_',' ') || '—'}
                        </span>
                      </td>

                      {/* Weight */}
                      <td className="px-3 py-3 text-ink-500 dark:text-ink-400">
                        {p.gross_weight ? `${p.gross_weight}g` : '—'}
                      </td>

                      {/* Price */}
                      <td className="px-3 py-3 font-medium text-ink-700 dark:text-ink-200">
                        {p.final_price && parseFloat(p.final_price) > 0
                          ? `${p.currency || 'AED'} ${Number(p.final_price).toLocaleString('en-AE')}`
                          : <span className="text-ink-400 text-[10px]">Price on Request</span>}
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        <StatusBadge status={p.status} />
                      </td>

                      {/* Flags */}
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.is_featured    && <FlagBadge label="Featured"    icon={Star}         color="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"/>}
                          {p.is_new_arrival && <FlagBadge label="New"         icon={Sparkles}     color="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"/>}
                          {p.is_best_seller && <FlagBadge label="Bestseller"  icon={TrendingUp}   color="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"/>}
                          {p.is_lab_grown   && <FlagBadge label="Lab grown"   icon={FlaskConical} color="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"/>}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-0.5">
                          {/* Mark as Sold */}
                          {p.status !== 'inactive' && (
                            <button
                              onClick={() => quickPatch(p.id, { status:'inactive' }, 'Marked as sold')}
                              title="Mark as sold"
                              className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-300 hover:text-red-500 transition-colors">
                              <ShoppingBag size={13}/>
                            </button>
                          )}
                          {/* Toggle featured */}
                          <button
                            onClick={() => quickPatch(p.id, { is_featured: !p.is_featured }, p.is_featured ? 'Removed from featured' : 'Added to featured')}
                            title={p.is_featured ? 'Remove from featured' : 'Add to featured'}
                            className={`p-1.5 rounded transition-colors ${p.is_featured ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-ink-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-500'}`}>
                            <Star size={13} className={p.is_featured ? 'fill-amber-400' : ''}/>
                          </button>
                          {/* Edit */}
                          <button onClick={() => navigate(`/products/${p.id}`)} title="Edit"
                            className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400 transition-colors">
                            <Edit2 size={13}/>
                          </button>
                          {/* Specs */}
                          <button onClick={() => navigate(`/jewellery-specs/${p.id}`)} title="Jewellery specs"
                            className="p-1.5 rounded hover:bg-amber-50 dark:hover:bg-amber-900/20 text-ink-400 hover:text-amber-500 transition-colors">
                            <Gem size={13}/>
                          </button>
                          {/* Delete */}
                          <button onClick={() => setDeleteConfirm({ id: p.id, name: p.name })} title="Delete"
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500 transition-colors">
                            <Trash2 size={13}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-ink-200/60 dark:border-ink-700">
              <span className="text-[11px] text-ink-400">
                Page {pagination.page} of {pagination.pages} · {pagination.total} products
              </span>
              <div className="flex gap-1">
                <button onClick={() => load(pagination.page - 1)} disabled={pagination.page <= 1}
                  className="btn-ghost p-1.5 disabled:opacity-30"><ChevronLeft size={14}/></button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const p = Math.max(1, Math.min(pagination.page - 2, pagination.pages - 4)) + i;
                  return (
                    <button key={p} onClick={() => load(p)}
                      className={`w-7 h-7 rounded-lg text-xs transition-colors ${p === pagination.page ? 'bg-gold-500 text-white' : 'btn-ghost'}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => load(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                  className="btn-ghost p-1.5 disabled:opacity-30"><ChevronRight size={14}/></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
