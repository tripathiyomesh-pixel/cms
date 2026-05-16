import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { Shield, Plus, Trash2, GripVertical, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const PRESETS = [
  { label: 'IGI Certified', icon: '🏆' },
  { label: 'GIA Certified', icon: '💎' },
  { label: 'BIS Hallmarked', icon: '🔖' },
  { label: 'Conflict-free diamonds', icon: '✅' },
  { label: '30-day returns', icon: '🔄' },
  { label: 'Lifetime polishing', icon: '✨' },
  { label: 'Secure packaging', icon: '📦' },
  { label: 'Authentic guarantee', icon: '🛡️' },
  { label: 'Free shipping', icon: '🚚' },
  { label: 'Ethically sourced', icon: '🌿' },
];

export default function TrustBadgesPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', icon: '' });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('jcms_user') || '{}');
      const res = await api.get('/jewellery/trust-badges', { params: { license_id: user.license_id || user.id } });
      setBadges(res.data.data || []);
    } catch { toast.error('Failed to load badges'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.label) return toast.error('Label required');
    setSaving(true);
    try {
      await api.post('/jewellery/trust-badges', { ...form, sort_order: badges.length });
      toast.success('Badge added');
      setShowForm(false);
      setForm({ label: '', icon: '' });
      load();
    } catch { toast.error('Failed'); }
    setSaving(false);
  };

  const handleDelete = async (id, label) => {
    if (!confirm(`Remove "${label}"?`)) return;
    try {
      await api.delete(`/jewellery/trust-badges/${id}`);
      toast.success('Removed');
      load();
    } catch { toast.error('Failed'); }
  };

  const addPreset = (p) => setForm({ label: p.label, icon: p.icon });

  return (
    <>
      <Topbar title="Trust badges" subtitle="Displayed on your storefront to build customer confidence"
        collapsed={collapsed} onToggle={toggleSidebar}
        actions={<button onClick={() => setShowForm(true)} className="btn-gold flex items-center gap-1.5 text-xs"><Plus size={14} /> Add badge</button>} />

      <div className="flex-1 overflow-y-auto p-5">
        {/* Preview strip */}
        {badges.length > 0 && (
          <div className="card mb-5">
            <p className="text-xs text-ink-400 mb-3 font-medium uppercase tracking-wide">Storefront preview</p>
            <div className="flex flex-wrap gap-3">
              {badges.map(b => (
                <div key={b.id} className="flex items-center gap-2 bg-ink-50 dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-full px-3 py-1.5 text-xs font-medium text-ink-600 dark:text-ink-300">
                  {b.icon && <span>{b.icon}</span>}
                  {b.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? <p className="text-ink-400 text-sm">Loading…</p> : badges.length === 0 ? (
          <div className="card text-center py-16">
            <Shield size={32} className="mx-auto text-ink-300 mb-3" />
            <p className="text-ink-400 text-sm mb-4">No trust badges yet</p>
            <button onClick={() => setShowForm(true)} className="btn-gold text-xs">Add first badge</button>
          </div>
        ) : (
          <div className="card">
            {badges.map((b, i) => (
              <div key={b.id} className={`flex items-center gap-3 py-3 ${i < badges.length - 1 ? 'border-b border-ink-100 dark:border-ink-800' : ''}`}>
                <GripVertical size={14} className="text-ink-300 cursor-grab" />
                <span className="text-lg">{b.icon || '🏷️'}</span>
                <span className="flex-1 text-sm font-medium text-ink-700 dark:text-ink-200">{b.label}</span>
                <span className="text-xs text-ink-400">#{b.sort_order + 1}</span>
                <button onClick={() => handleDelete(b.id, b.label)}
                  className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-ink-200 dark:border-ink-700">
              <h2 className="font-semibold text-ink-800 dark:text-ink-100">Add trust badge</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Quick presets</label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map(p => (
                    <button key={p.label} onClick={() => addPreset(p)}
                      className="text-xs px-2.5 py-1 rounded-full border border-ink-200 dark:border-ink-700 hover:border-gold-400 hover:text-gold-600 transition-colors">
                      {p.icon} {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Icon / emoji</label>
                  <input className="input-field text-center text-lg" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="💎" maxLength={4} />
                </div>
                <div className="col-span-2">
                  <label className="label">Badge label *</label>
                  <input className="input-field" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. IGI Certified" />
                </div>
              </div>
              {form.label && (
                <div className="flex items-center gap-2 bg-ink-50 dark:bg-ink-800 rounded-full px-3 py-2 text-sm w-fit">
                  {form.icon && <span>{form.icon}</span>}
                  <span className="font-medium text-ink-700 dark:text-ink-200">{form.label}</span>
                  <span className="text-xs text-ink-400">preview</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 p-5 border-t border-ink-200 dark:border-ink-700">
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-gold flex-1">{saving ? 'Saving…' : 'Add badge'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
