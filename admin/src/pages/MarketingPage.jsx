import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { marketingAPI } from '../services/api';
import { Plus, Trash2, Image, Tag, X, Save, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MarketingPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [tab, setTab] = useState('banners');
  const [banners, setBanners] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.allSettled([marketingAPI.banners({}), marketingAPI.promoCodes()]);
      if (bRes.status === 'fulfilled') setBanners(bRes.value.data.data || []);
      if (pRes.status === 'fulfilled') setPromos(pRes.value.data.data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteBanner = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try { await marketingAPI.deleteBanner(id); toast.success('Banner deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const deletePromo = async (id) => {
    if (!confirm('Delete this promo code?')) return;
    try { await marketingAPI.deletePromo(id); toast.success('Promo deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <>
      <Topbar title="Marketing" subtitle="Banners and promo codes"
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={
          <button onClick={() => setModal(tab === 'banners' ? 'banner' : 'promo')} className="btn-gold flex items-center gap-1.5 text-xs">
            <Plus size={14} /> {tab === 'banners' ? 'New banner' : 'New promo code'}
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-5">
        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-ink-100 dark:bg-ink-800 rounded-lg p-1 w-fit border border-ink-200/60 dark:border-ink-700">
          <button onClick={() => setTab('banners')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'banners' ? 'bg-white dark:bg-ink-700 text-ink-700 dark:text-ink-200 shadow-sm' : 'text-ink-400'}`}>
            <Image size={12} className="inline mr-1.5" />Banners ({banners.length})
          </button>
          <button onClick={() => setTab('promos')} className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${tab === 'promos' ? 'bg-white dark:bg-ink-700 text-ink-700 dark:text-ink-200 shadow-sm' : 'text-ink-400'}`}>
            <Tag size={12} className="inline mr-1.5" />Promo codes ({promos.length})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" /></div>
        ) : tab === 'banners' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.length === 0 ? (
              <div className="card col-span-2 flex flex-col items-center py-12">
                <Image size={28} className="text-ink-300 mb-3" />
                <p className="text-xs text-ink-400">No banners yet</p>
              </div>
            ) : banners.map(b => (
              <div key={b.id} className="card overflow-hidden">
                <div className="h-36 bg-ink-100 dark:bg-ink-700">
                  {b.image_url ? <img src={b.image_url} alt="" className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center"><Image size={28} className="text-ink-300" /></div>}
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-ink-700 dark:text-ink-200">{b.title || 'Untitled'}</h4>
                      <p className="text-[10px] text-ink-400 mt-0.5">{b.position} · {b.country_code || 'All countries'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${b.is_active ? 'badge-green' : 'badge-gray'}`}>{b.is_active ? 'Active' : 'Inactive'}</span>
                      <button onClick={() => deleteBanner(b.id)} className="p-1 rounded hover:bg-red-50 text-ink-400 hover:text-red-500"><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-200/60 dark:border-ink-700">
                  {['Code', 'Type', 'Value', 'Min order', 'Used', 'Status', ''].map(h =>
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-medium text-ink-400 tracking-wide uppercase">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {promos.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-xs text-ink-400">No promo codes</td></tr>
                ) : promos.map(p => (
                  <tr key={p.id} className="border-b border-ink-100 dark:border-ink-800">
                    <td className="px-4 py-3"><span className="font-mono text-xs font-medium text-ink-700 dark:text-ink-200 bg-ink-100 dark:bg-ink-700 px-2 py-1 rounded">{p.code}</span></td>
                    <td className="px-4 py-3"><span className="badge badge-gold">{p.type}</span></td>
                    <td className="px-4 py-3 text-xs font-medium text-ink-700 dark:text-ink-200">{p.type === 'percent' ? `${p.value}%` : `AED ${p.value}`}</td>
                    <td className="px-4 py-3 text-xs text-ink-500">{p.min_order || '—'}</td>
                    <td className="px-4 py-3 text-xs text-ink-500">{p.usage_count}/{p.usage_limit || '∞'}</td>
                    <td className="px-4 py-3"><span className={`badge ${p.is_active ? 'badge-green' : 'badge-gray'}`}>{p.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3"><button onClick={() => deletePromo(p.id)} className="p-1 rounded hover:bg-red-50 text-ink-400 hover:text-red-500"><Trash2 size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'promo' && <PromoModal onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />}
    </>
  );
}

function PromoModal({ onClose, onSave }) {
  const [form, setForm] = useState({ code: '', type: 'percent', value: '', min_order: '', max_discount: '', usage_limit: '', description: '' });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await marketingAPI.createPromo({ ...form, value: parseFloat(form.value), min_order: parseFloat(form.min_order) || undefined, max_discount: parseFloat(form.max_discount) || undefined, usage_limit: parseInt(form.usage_limit) || undefined });
      toast.success('Promo code created');
      onSave();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-200/60 dark:border-ink-700">
          <h3 className="text-sm font-medium text-ink-700 dark:text-ink-200">New promo code</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-ink-100 text-ink-400"><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Code</label>
              <input value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} className="input-field font-mono" required placeholder="SUMMER25" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="input-field">
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed amount</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Value</label>
              <input type="number" value={form.value} onChange={e => set('value', e.target.value)} className="input-field" required placeholder={form.type === 'percent' ? '10' : '100'} />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Min order</label>
              <input type="number" value={form.min_order} onChange={e => set('min_order', e.target.value)} className="input-field" placeholder="500" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-ink-500 mb-1.5">Description</label>
            <input value={form.description} onChange={e => set('description', e.target.value)} className="input-field" placeholder="Summer sale 25% off" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-outline text-xs">Cancel</button>
            <button type="submit" disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs"><Save size={13} /> Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
