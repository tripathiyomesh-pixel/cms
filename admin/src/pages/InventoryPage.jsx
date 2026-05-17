import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { inventoryAPI, productsAPI } from '../services/api';
import { AlertTriangle, Package, ArrowUpDown, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(5);
  const [bulkMode, setBulkMode] = useState(false);
  const [updates, setUpdates] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await inventoryAPI.lowStock(threshold);
      setLowStock(res.data.data?.products || []);
    } catch { toast.error('Failed to load inventory'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [threshold]);

  const handleBulkSave = async () => {
    const items = Object.entries(updates)
      .filter(([_, qty]) => qty !== '' && qty !== undefined)
      .map(([product_id, quantity]) => ({ product_id, quantity: parseInt(quantity), type: 'adjustment' }));
    if (!items.length) return toast.error('No changes to save');
    try {
      await inventoryAPI.bulkUpdate(items);
      toast.success(`${items.length} item(s) updated`);
      setUpdates({});
      setBulkMode(false);
      load();
    } catch { toast.error('Bulk update failed'); }
  };

  return (
    <>
      <Topbar title="Inventory" subtitle="Stock levels and alerts"
        actions={
          <div className="flex gap-2">
            {bulkMode ? (
              <>
                <button onClick={() => { setBulkMode(false); setUpdates({}); }} className="btn-outline text-xs">Cancel</button>
                <button onClick={handleBulkSave} className="btn-gold flex items-center gap-1.5 text-xs"><Save size={13} /> Save changes</button>
              </>
            ) : (
              <button onClick={() => setBulkMode(true)} className="btn-outline flex items-center gap-1.5 text-xs">
                <ArrowUpDown size={13} /> Bulk update
              </button>
            )}
          </div>
        }
      />
      <div className="flex-1 overflow-y-auto p-5">
        {/* Threshold selector */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-ink-500">Show items with stock below:</span>
          <select value={threshold} onChange={e => setThreshold(parseInt(e.target.value))} className="input-field w-20 py-1.5 text-xs">
            {[3, 5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="badge badge-red text-xs">{lowStock.length} alert{lowStock.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-200/60 dark:border-ink-700">
                {['Product', 'SKU', 'Metal', 'Purity', 'Current stock', 'Alert threshold', bulkMode ? 'New stock' : ''].filter(Boolean).map(h =>
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-ink-400 tracking-wide uppercase">{h}</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-ink-400 text-xs">Loading...</td></tr>
              ) : lowStock.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <Package size={24} className="text-ink-300 mx-auto mb-2" />
                  <p className="text-xs text-ink-400">All stock levels are healthy</p>
                </td></tr>
              ) : lowStock.map(p => (
                <tr key={p.id} className="border-b border-ink-100 dark:border-ink-800">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.stock_quantity === 0 && <AlertTriangle size={13} className="text-red-500 flex-shrink-0" />}
                      <span className="text-xs font-medium text-ink-700 dark:text-ink-200">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-500 font-mono">{p.sku}</td>
                  <td className="px-4 py-3"><span className="badge badge-gold">{p.metal_type?.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3 text-xs text-ink-500">{p.purity}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${p.stock_quantity === 0 ? 'text-red-600' : p.stock_quantity <= 3 ? 'text-orange-500' : 'text-ink-600 dark:text-ink-300'}`}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-400">{p.low_stock_alert}</td>
                  {bulkMode && (
                    <td className="px-4 py-3">
                      <input type="number" min="0" value={updates[p.id] || ''}
                        onChange={e => setUpdates(u => ({ ...u, [p.id]: e.target.value }))}
                        className="input-field w-20 py-1 text-xs" placeholder={p.stock_quantity} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
