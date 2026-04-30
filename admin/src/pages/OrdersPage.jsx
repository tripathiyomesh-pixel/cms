import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { ShoppingCart, X, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const STATUS_COLORS = {
  pending: 'badge-gold', confirmed: 'badge-blue', processing: 'badge-blue',
  shipped: 'badge-green', delivered: 'badge-green', cancelled: 'badge-red', returned: 'badge-red',
};
const STATUSES = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function OrdersPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders', { params: { status: filter === 'all' ? undefined : filter } });
      setOrders(res.data.data || []);
    } catch { setOrders([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}`, { status });
      toast.success(`Order marked as ${status}`);
      load();
      if (detail?.id === id) setDetail(d => ({ ...d, status }));
    } catch { toast.error('Update failed'); }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <>
      <Topbar title="Orders" subtitle={`${filtered.length} orders`} collapsed={collapsed} onToggle={toggleSidebar} />
      <div className="flex-1 overflow-y-auto p-5">
        {/* Status tabs */}
        <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-all ${
                filter === s ? 'bg-gold-500 text-white' : 'bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-500 hover:border-gold-400'
              }`}>
              {s}
            </button>
          ))}
        </div>

        <div className="card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200/60 dark:border-ink-700">
                {['Order #', 'Customer', 'Items', 'Total', 'Status', 'Date', ''].map(h =>
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-ink-400 tracking-wide uppercase">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-ink-400 text-xs">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16">
                  <ShoppingCart size={28} className="text-ink-300 mx-auto mb-3" />
                  <p className="text-xs text-ink-400">{filter === 'all' ? 'No orders yet' : `No ${filter} orders`}</p>
                </td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="border-b border-ink-100 dark:border-ink-800 hover:bg-ink-50/50 dark:hover:bg-ink-800/50 cursor-pointer"
                  onClick={() => setDetail(o)}>
                  <td className="px-4 py-3 text-xs font-mono font-medium text-ink-700 dark:text-ink-200">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-ink-700 dark:text-ink-200">{o.customer_name || '—'}</div>
                    <div className="text-[10px] text-ink-400">{o.customer_email}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500">{o.items?.length || 0} items</td>
                  <td className="px-4 py-3 text-xs font-medium text-ink-700 dark:text-ink-200">{o.currency} {Number(o.total_amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-3"><span className={`badge ${STATUS_COLORS[o.status] || 'badge-gray'} capitalize`}>{o.status}</span></td>
                  <td className="px-4 py-3 text-[11px] text-ink-400">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={e => { e.stopPropagation(); setDetail(o); }} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-400">
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDetail(null)}>
          <div className="card w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
              <div>
                <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">Order {detail.order_number}</h3>
                <p className="text-[10px] text-ink-400 mt-0.5">{new Date(detail.created_at).toLocaleString()}</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-1 rounded hover:bg-ink-100 text-ink-400"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] text-ink-400 uppercase tracking-wider mb-1">Customer</div>
                  <div className="text-xs font-medium text-ink-700 dark:text-ink-200">{detail.customer_name || '—'}</div>
                  <div className="text-[10px] text-ink-400">{detail.customer_email}</div>
                  <div className="text-[10px] text-ink-400">{detail.customer_phone}</div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-400 uppercase tracking-wider mb-1">Status</div>
                  <select value={detail.status} onChange={e => updateStatus(detail.id, e.target.value)} className="input-field py-1 text-xs">
                    {STATUSES.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {detail.items?.length > 0 && (
                <div>
                  <div className="text-[10px] text-ink-400 uppercase tracking-wider mb-2">Items</div>
                  <div className="space-y-2">
                    {detail.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-ink-100 dark:border-ink-700 last:border-0">
                        <div className="text-xs text-ink-700 dark:text-ink-200">{item.name || `Item ${i + 1}`}</div>
                        <div className="text-xs text-ink-500">x{item.qty || 1} — {detail.currency} {item.price || 0}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-ink-50 dark:bg-ink-800 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-xs text-ink-500"><span>Subtotal</span><span>{detail.currency} {detail.subtotal || '—'}</span></div>
                <div className="flex justify-between text-xs text-ink-500"><span>Tax</span><span>{detail.currency} {detail.tax_amount || 0}</span></div>
                <div className="flex justify-between text-sm font-medium text-ink-700 dark:text-ink-200 pt-1 border-t border-ink-200 dark:border-ink-700">
                  <span>Total</span><span>{detail.currency} {Number(detail.total_amount || 0).toLocaleString()}</span>
                </div>
              </div>

              {detail.notes && (
                <div>
                  <div className="text-[10px] text-ink-400 uppercase tracking-wider mb-1">Notes</div>
                  <p className="text-xs text-ink-600 dark:text-ink-300">{detail.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
