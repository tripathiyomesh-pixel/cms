import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { MapPin, Plus, Trash2, Phone, Clock, Globe, Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const COUNTRIES = [
  { code: 'AE', name: 'UAE' }, { code: 'SA', name: 'Saudi Arabia' },
  { code: 'QA', name: 'Qatar' }, { code: 'KW', name: 'Kuwait' },
  { code: 'BH', name: 'Bahrain' }, { code: 'OM', name: 'Oman' },
  { code: 'IN', name: 'India' }, { code: 'GB', name: 'UK' },
];

const empty = { name: '', address: '', city: '', country_code: 'AE', phone: '', whatsapp: '', email: '', google_maps_url: '', working_hours: '', is_primary: false };

export default function StoreLocationsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('jcms_user') || '{}');
      const res = await api.get('/jewellery/locations', { params: { license_id: user.license_id || user.id } });
      setLocations(res.data.data || []);
    } catch { toast.error('Failed to load locations'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.address) return toast.error('Name and address required');
    setSaving(true);
    try {
      await api.post('/jewellery/locations', form);
      toast.success('Location added');
      setShowForm(false);
      setForm(empty);
      load();
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Remove "${name}"?`)) return;
    try {
      await api.delete(`/jewellery/locations/${id}`);
      toast.success('Removed');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <>
      <Topbar title="Store locations" subtitle={`${locations.length} boutique${locations.length !== 1 ? 's' : ''}`}
        actions={<button onClick={() => setShowForm(true)} className="btn-gold flex items-center gap-1.5 text-xs"><Plus size={14} /> Add location</button>} />

      <div className="flex-1 overflow-y-auto p-5">
        {loading ? <p className="text-ink-400 text-sm">Loading…</p> : locations.length === 0 ? (
          <div className="card text-center py-16">
            <MapPin size={32} className="mx-auto text-ink-300 mb-3" />
            <p className="text-ink-400 text-sm mb-4">No store locations yet</p>
            <button onClick={() => setShowForm(true)} className="btn-gold text-xs">Add first location</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map(loc => (
              <div key={loc.id} className="card relative">
                {loc.is_primary && (
                  <span className="absolute top-3 right-3 flex items-center gap-1 text-[10px] bg-gold-50 dark:bg-gold-900/20 text-gold-600 dark:text-gold-400 px-2 py-0.5 rounded-full font-medium">
                    <Star size={10} /> Primary
                  </span>
                )}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-gold-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-ink-700 dark:text-ink-200">{loc.name}</h3>
                    <p className="text-xs text-ink-400 mt-0.5">{loc.address}{loc.city ? `, ${loc.city}` : ''} · {loc.country_code}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-ink-500">
                  {loc.phone && <div className="flex items-center gap-2"><Phone size={12} />{loc.phone}</div>}
                  {loc.working_hours && <div className="flex items-center gap-2"><Clock size={12} />{loc.working_hours}</div>}
                  {loc.google_maps_url && (
                    <a href={loc.google_maps_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 text-gold-500 hover:underline"><Globe size={12} />View on Google Maps</a>
                  )}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-ink-100 dark:border-ink-800">
                  {loc.whatsapp ? (
                    <a href={`https://wa.me/${loc.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                      className="text-xs text-green-600 hover:underline">WhatsApp: {loc.whatsapp}</a>
                  ) : <span />}
                  <button onClick={() => handleDelete(loc.id, loc.name)}
                    className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add location modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-ink-200 dark:border-ink-700">
              <h2 className="font-semibold text-ink-800 dark:text-ink-100">Add store location</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Location name *</label>
                  <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Dubai Mall Boutique" />
                </div>
                <div className="col-span-2">
                  <label className="label">Address *</label>
                  <textarea className="input-field" rows={2} value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input className="input-field" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Dubai" />
                </div>
                <div>
                  <label className="label">Country</label>
                  <select className="input-field" value={form.country_code} onChange={e => set('country_code', e.target.value)}>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input-field" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+971 4 000 0000" />
                </div>
                <div>
                  <label className="label">WhatsApp</label>
                  <input className="input-field" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+971 50 000 0000" />
                </div>
                <div className="col-span-2">
                  <label className="label">Email</label>
                  <input className="input-field" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="store@brand.com" />
                </div>
                <div className="col-span-2">
                  <label className="label">Working hours</label>
                  <input className="input-field" value={form.working_hours} onChange={e => set('working_hours', e.target.value)} placeholder="Mon–Sat 10am–8pm, Fri 2pm–10pm" />
                </div>
                <div className="col-span-2">
                  <label className="label">Google Maps URL</label>
                  <input className="input-field" value={form.google_maps_url} onChange={e => set('google_maps_url', e.target.value)} placeholder="https://maps.google.com/..." />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_primary} onChange={e => set('is_primary', e.target.checked)} />
                    <span className="text-sm text-ink-600 dark:text-ink-300">Set as primary location</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-ink-200 dark:border-ink-700">
              <button onClick={() => setShowForm(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-gold flex-1">{saving ? 'Saving…' : 'Add location'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
