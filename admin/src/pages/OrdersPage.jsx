import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { ordersAPI } from '../services/api';
import { ShoppingBag, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  pending:    'bg-amber-50 dark:bg-amber-900/20 text-amber-600',
  confirmed:  'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
  processing: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600',
  shipped:    'bg-purple-50 dark:bg-purple-900/20 text-purple-600',
  delivered:  'bg-green-50 dark:bg-green-900/20 text-green-600',
  cancelled:  'bg-red-50 dark:bg-red-900/20 text-red-500',
  returned:   'bg-ink-50 dark:bg-ink-800 text-ink-500',
};
const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','returned'];

export default function OrdersPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [orders, setOrders]   = useState([]);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);
  const [filter, setFilter]   = useState('');
  const [search, setSearch]   = useState('');
  const [detail, setDetail]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const limit = 20;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const r = await ordersAPI.list({ page: p, limit, status: filter || undefined, search: search || undefined });
      setOrders(r.data?.data || []);
      setTotal(r.data?.total || 0);
    } catch { setOrders([]); }
    setLoading(false);
  };

  useEffect(() => { load(1); }, [filter]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await ordersAPI.updateStatus(id, { status });
      toast.success(`Order marked as ${status}`);
      load(page);
      if (detail?.id === id) setDetail(d => ({...d, status}));
    } catch { toast.error('Update failed'); }
    setUpdatingId(null);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Topbar title="Orders" subtitle={`${total} orders`} />

      <div className="flex-1 overflow-y-auto p-5">
        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load(1)}
              placeholder="Search order # or customer…" className="input-field pl-9 py-2 w-56 text-xs" />
          </div>
          <div className="flex gap-1">
            {['', ...STATUSES].map(s => (
              <button key={s} onClick={() => { setFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === s ? 'bg-gold-500 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-500 hover:bg-ink-200 dark:hover:bg-ink-700'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* List */}
          <div className="lg:col-span-2 card">
            {loading ? (
              <div className="p-8 text-center text-xs text-ink-400">Loading…</div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingBag size={28} className="mx-auto text-ink-300 mb-3" />
                <p className="text-sm text-ink-400">No orders found</p>
              </div>
            ) : orders.map((o, i) => (
              <div key={o.id} onClick={() => setDetail(o)}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-800/50 transition-colors ${i < orders.length - 1 ? 'border-b border-ink-100 dark:border-ink-800' : ''} ${detail?.id === o.id ? 'bg-gold-50/50 dark:bg-gold-900/10' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-ink-700 dark:text-ink-200 font-mono">{o.order_number}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                  </div>
                  <div className="text-xs text-ink-400">{o.customer_name || '—'} · {o.customer_phone || '—'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-ink-700 dark:text-ink-200">{o.currency} {Number(o.total_amount||0).toLocaleString()}</div>
                  <div className="text-[10px] text-ink-400">{new Date(o.created_at).toLocaleDateString('en-AE', { day:'numeric', month:'short' })}</div>
                </div>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-ink-200/60 dark:border-ink-700">
                <span className="text-xs text-ink-400">Page {page} of {totalPages}</span>
                <div className="flex gap-1">
                  <button onClick={() => { setPage(p=>p-1); load(page-1); }} disabled={page===1} className="btn-ghost disabled:opacity-30 p-1.5"><ChevronLeft size={14}/></button>
                  <button onClick={() => { setPage(p=>p+1); load(page+1); }} disabled={page>=totalPages} className="btn-ghost disabled:opacity-30 p-1.5"><ChevronRight size={14}/></button>
                </div>
              </div>
            )}
          </div>

          {/* Detail panel */}
          <div>
            {detail ? (
              <div className="card p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-mono text-xs text-ink-400">{detail.order_number}</p>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[detail.status]}`}>{detail.status}</span>
                  </div>
                  <button onClick={() => setDetail(null)} className="p-1 rounded hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={14}/></button>
                </div>

                <div className="space-y-1.5 text-xs mb-4">
                  {[
                    ['Customer', detail.customer_name],
                    ['Phone',    detail.customer_phone],
                    ['Email',    detail.customer_email],
                    ['Country',  detail.country_code],
                    ['Total',    `${detail.currency} ${Number(detail.total_amount||0).toLocaleString()}`],
                    ['Tax',      `${detail.currency} ${Number(detail.tax_amount||0).toLocaleString()}`],
                    ['Date',     new Date(detail.created_at).toLocaleString('en-AE')],
                  ].filter(([,v]) => v).map(([k,v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-ink-400">{k}</span>
                      <span className="text-ink-600 dark:text-ink-300 font-medium">{v}</span>
                    </div>
                  ))}
                </div>

                {detail.notes && (
                  <div className="bg-ink-50 dark:bg-ink-800 rounded p-2 text-xs text-ink-500 mb-4">{detail.notes}</div>
                )}

                <div>
                  <p className="text-[10px] font-medium text-ink-400 uppercase tracking-wide mb-2">Update status</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => updateStatus(detail.id, s)}
                        disabled={updatingId === detail.id || detail.status === s}
                        className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-colors
                          ${detail.status === s ? STATUS_COLORS[s] + ' opacity-100 cursor-default' : 'bg-ink-100 dark:bg-ink-800 text-ink-500 hover:bg-ink-200 dark:hover:bg-ink-700'}
                          disabled:opacity-40`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {detail.customer_phone && (
                  <a href={`https://wa.me/${detail.customer_phone.replace(/\D/g,'')}`}
                    target="_blank" rel="noreferrer"
                    className="mt-3 flex items-center justify-center gap-2 text-xs py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 w-full">
                    💬 Contact on WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <div className="card p-6 text-center">
                <ShoppingBag size={24} className="mx-auto text-ink-300 mb-2" />
                <p className="text-xs text-ink-400">Select an order to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
