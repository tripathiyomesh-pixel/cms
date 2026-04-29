import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { productsAPI } from '../services/api';
import { Plus, Search, Filter, ChevronLeft, ChevronRight, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';

const METAL_COLORS = {
  gold: 'badge-gold', silver: 'badge-gray', platinum: 'badge-blue',
  rose_gold: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
  white_gold: 'badge-gray', palladium: 'badge-gray',
};
const STATUS_COLORS = { active: 'badge-green', draft: 'badge-gray', inactive: 'badge-red', archived: 'badge-gray' };

export default function ProductsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ metal_type: '', status: '', sort: 'created_at', order: 'DESC' });

  const load = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: pagination.limit, ...filters };
      if (search) params.search = search;
      const res = await productsAPI.list(params);
      setProducts(res.data.data || []);
      setPagination(res.data.pagination || {});
    } catch (e) { toast.error('Failed to load products'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    load(1);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await productsAPI.delete(id);
      toast.success('Product deleted');
      load(pagination.page);
    } catch (e) { toast.error('Delete failed'); }
  };

  return (
    <>
      <Topbar
        title="Products"
        subtitle={`${pagination.total || 0} total products`}
        collapsed={collapsed}
        onToggle={toggleSidebar}
        actions={
          <button onClick={() => navigate('/products/new')} className="btn-gold flex items-center gap-1.5 text-xs">
            <Plus size={14} /> Add product
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-5">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-4">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..." className="input-field pl-9 py-2" />
          </form>
          <select value={filters.metal_type} onChange={e => setFilters(f => ({ ...f, metal_type: e.target.value }))}
            className="input-field w-36 py-2">
            <option value="">All metals</option>
            {['gold','silver','platinum','rose_gold','white_gold'].map(m =>
              <option key={m} value={m}>{m.replace('_',' ')}</option>
            )}
          </select>
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="input-field w-32 py-2">
            <option value="">All status</option>
            {['active','draft','inactive','archived'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200/60 dark:border-ink-700">
                  {['Product','SKU','Metal','Purity','Weight','Price','Stock','Status',''].map(h =>
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-ink-400 dark:text-ink-500 tracking-wide uppercase">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} className="text-center py-12 text-ink-400 text-xs">Loading...</td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12">
                    <div className="text-ink-400 text-xs mb-3">No products found</div>
                    <button onClick={() => navigate('/products/new')} className="btn-gold text-xs">Add first product</button>
                  </td></tr>
                ) : products.map(p => (
                  <tr key={p.id} className="border-b border-ink-100 dark:border-ink-800 hover:bg-ink-50/50 dark:hover:bg-ink-800/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/products/${p.id}`)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-ink-100 dark:bg-ink-700 border border-ink-200 dark:border-ink-600 flex items-center justify-center flex-shrink-0">
                          {p.media?.[0]?.thumb_url ? (
                            <img src={p.media[0].thumb_url} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <Package size={14} className="text-gold-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-medium text-ink-700 dark:text-ink-200 truncate max-w-[180px]">{p.name}</div>
                          <div className="text-[10px] text-ink-400 truncate">{p.category?.name || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-500 font-mono">{p.sku}</td>
                    <td className="px-4 py-3"><span className={`badge ${METAL_COLORS[p.metal_type] || 'badge-gray'}`}>{p.metal_type?.replace('_',' ')}</span></td>
                    <td className="px-4 py-3 text-xs text-ink-600 dark:text-ink-300">{p.purity}</td>
                    <td className="px-4 py-3 text-xs text-ink-600 dark:text-ink-300">{p.gross_weight}g</td>
                    <td className="px-4 py-3 text-xs font-medium text-ink-700 dark:text-ink-200">{p.currency} {Number(p.final_price).toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-ink-600 dark:text-ink-300">{p.stock_quantity}</td>
                    <td className="px-4 py-3"><span className={`badge ${STATUS_COLORS[p.status] || 'badge-gray'}`}>{p.status}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => navigate(`/products/${p.id}`)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-ink-200/60 dark:border-ink-700">
              <div className="text-[11px] text-ink-400">
                Page {pagination.page} of {pagination.pages} ({pagination.total} items)
              </div>
              <div className="flex gap-1">
                <button onClick={() => load(pagination.page - 1)} disabled={pagination.page <= 1}
                  className="btn-ghost disabled:opacity-30"><ChevronLeft size={14} /></button>
                <button onClick={() => load(pagination.page + 1)} disabled={pagination.page >= pagination.pages}
                  className="btn-ghost disabled:opacity-30"><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
