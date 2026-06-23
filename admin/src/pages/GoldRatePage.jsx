import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import api from '../services/api';
import {
  RefreshCw, Save, TrendingUp, TrendingDown, Minus,
  History, Shield, Edit2, Check, X, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const KARATS = [
  { key:'rate_24k', label:'24 Karat (Pure Gold)' },
  { key:'rate_22k', label:'22 Karat' },
  { key:'rate_21k', label:'21 Karat' },
  { key:'rate_18k', label:'18 Karat' },
  { key:'rate_14k', label:'14 Karat' },
];

function GoldRateCard({ label, rate, prev }) {
  const change = prev != null ? rate - prev : 0;
  const Icon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-500' : 'text-ink-400';
  return (
    <div className="card p-5">
      <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-semibold text-ink-800 dark:text-ink-100 mb-1">
        AED {rate ? parseFloat(rate).toLocaleString('en-AE', { minimumFractionDigits:2, maximumFractionDigits:2 }) : '—'}
      </p>
      {change !== 0 && (
        <div className={`flex items-center gap-1 text-xs ${changeColor}`}>
          <Icon size={11}/>
          <span>{change > 0 ? '+' : ''}{change.toFixed(2)} vs prev</span>
        </div>
      )}
    </div>
  );
}

export default function GoldRatePage() {
  const { collapsed } = useOutletContext() || {};
  const [current,   setCurrent]   = useState(null);
  const [history,   setHistory]   = useState([]);
  const [scraping,  setScraping]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [tab,       setTab]       = useState('current');
  const [editMode,  setEditMode]  = useState(false);
  const [form,      setForm]      = useState({ rate_24k:'', rate_22k:'', rate_21k:'', rate_18k:'', rate_14k:'' });

  const load = async () => {
    try {
      const r = await api.get('/gold-rates/current');
      const d = r.data.data;
      setCurrent(d);
      if (d) setForm({
        rate_24k: d.rate_24k || '',
        rate_22k: d.rate_22k || '',
        rate_21k: d.rate_21k || '',
        rate_18k: d.rate_18k || '',
        rate_14k: d.rate_14k || '',
      });
    } catch {}
  };

  const loadHistory = async () => {
    try { const r = await api.get('/gold-rates/history'); setHistory(r.data.data || []); } catch {}
  };

  useEffect(() => { load(); loadHistory(); }, []);

  const handleScrape = async () => {
    setScraping(true);
    try {
      await api.post('/gold-rates/scrape');
      await load();
      toast.success('Gold rates refreshed from market data');
    } catch { toast.error('Scrape failed — enter manually'); }
    setScraping(false);
  };

  const handleManualSave = async () => {
    if (!form.rate_24k) { toast.error('24K rate required'); return; }
    setSaving(true);
    try {
      await api.post('/gold-rates/manual', form);
      await load();
      await loadHistory();
      setEditMode(false);
      toast.success('Gold rates updated');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const autoCalc = (val24k) => {
    const v = parseFloat(val24k);
    if (!v) return;
    setForm(f => ({
      ...f,
      rate_24k: val24k,
      rate_22k: f.rate_22k || (v * 22/24).toFixed(2),
      rate_21k: f.rate_21k || (v * 21/24).toFixed(2),
      rate_18k: f.rate_18k || (v * 18/24).toFixed(2),
      rate_14k: f.rate_14k || (v * 14/24).toFixed(2),
    }));
  };

  const lbl = 'block text-[11px] font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-1.5';
  const inp = 'input-field text-sm';

  return (
    <>
      <Topbar
        title="Gold rates"
        subtitle={current ? `Last updated: ${new Date(current.fetched_at || current.created_at).toLocaleString('en-AE')}` : 'No rates loaded yet'}
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleScrape} disabled={scraping}
              className="btn-ghost flex items-center gap-1.5 text-xs disabled:opacity-50">
              <RefreshCw size={13} className={scraping ? 'animate-spin' : ''}/>
              {scraping ? 'Fetching…' : 'Refresh from market'}
            </button>
            {!editMode ? (
              <button onClick={() => setEditMode(true)} className="btn-gold flex items-center gap-1.5 text-xs">
                <Edit2 size={13}/> Enter manually
              </button>
            ) : (
              <>
                <button onClick={() => setEditMode(false)} className="btn-ghost flex items-center gap-1.5 text-xs">
                  <X size={13}/> Cancel
                </button>
                <button onClick={handleManualSave} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs disabled:opacity-50">
                  <Check size={13}/>{saving ? 'Saving…' : 'Save rates'}
                </button>
              </>
            )}
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-ink-200/60 dark:border-ink-800">
          {[['current','Current Rates'],['history','Rate History']].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all ${tab===k?'border-gold-500 text-gold-600':'border-transparent text-ink-400 hover:text-ink-600'}`}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'current' && (
          <>
            {/* Current rate cards */}
            {current && !editMode && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {KARATS.map(k => (
                  <GoldRateCard key={k.key} label={k.label} rate={current[k.key]} prev={null}/>
                ))}
              </div>
            )}

            {/* Manual entry form */}
            {editMode && (
              <div className="card p-6 max-w-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={14} className="text-gold-500"/>
                  <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Manual Rate Entry</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className={lbl}>24 Karat rate (AED/gram) *</label>
                    <input type="number" step="0.01" value={form.rate_24k}
                      onChange={e => autoCalc(e.target.value)}
                      className={inp} placeholder="e.g. 315.00"/>
                    <p className="text-[10px] text-ink-400 mt-1">Other karats auto-calculated from this value</p>
                  </div>
                  {KARATS.slice(1).map(k => (
                    <div key={k.key}>
                      <label className={lbl}>{k.label} (AED/gram)</label>
                      <input type="number" step="0.01" value={form[k.key]}
                        onChange={e => setForm(f => ({ ...f, [k.key]: e.target.value }))}
                        className={inp} placeholder="Auto-calculated"/>
                    </div>
                  ))}
                </div>
                <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <AlertCircle size={13} className="text-amber-600 mt-0.5 flex-shrink-0"/>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                    Manual rates override scraped rates. They will be visible on the storefront immediately after saving.
                  </p>
                </div>
              </div>
            )}

            {/* Source badge */}
            {current && !editMode && (
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${current.source === 'manual' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                  {current.source === 'manual' ? '🖊 Manually entered' : '🔄 Auto-scraped'}
                </span>
                {current.fetched_at && (
                  <span className="text-xs text-ink-400">{new Date(current.fetched_at).toLocaleString('en-AE')}</span>
                )}
              </div>
            )}

            {!current && !editMode && (
              <div className="card p-8 text-center">
                <p className="text-ink-400 text-sm mb-3">No gold rates loaded yet.</p>
                <div className="flex justify-center gap-3">
                  <button onClick={handleScrape} className="btn-gold text-xs">Fetch from market</button>
                  <button onClick={() => setEditMode(true)} className="btn-ghost text-xs">Enter manually</button>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'history' && (
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-ink-100 dark:border-ink-800 flex items-center gap-2">
              <History size={13} className="text-ink-400"/>
              <span className="text-xs font-medium text-ink-600 dark:text-ink-300">Rate history (last 90 records)</span>
            </div>
            {history.length === 0 ? (
              <div className="p-6 text-center text-ink-400 text-sm">No history yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-ink-100 dark:border-ink-800">
                      {['Date','24K','22K','18K','Source'].map(h=>(
                        <th key={h} className="px-5 py-3 text-left font-semibold text-ink-400 uppercase tracking-wide text-[10px]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r,i) => (
                      <tr key={i} className="border-b border-ink-50 dark:border-ink-800/50 hover:bg-ink-50/50 dark:hover:bg-ink-800/30">
                        <td className="px-5 py-3 text-ink-500">{new Date(r.recorded_at||r.created_at).toLocaleString('en-AE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</td>
                        <td className="px-5 py-3 font-semibold text-ink-700 dark:text-ink-200">{r.rate_24k ? `AED ${parseFloat(r.rate_24k).toFixed(2)}` : '—'}</td>
                        <td className="px-5 py-3 text-ink-500">{r.rate_22k ? `AED ${parseFloat(r.rate_22k).toFixed(2)}` : '—'}</td>
                        <td className="px-5 py-3 text-ink-500">{r.rate_18k ? `AED ${parseFloat(r.rate_18k).toFixed(2)}` : '—'}</td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${r.source==='manual'?'bg-amber-100 text-amber-700':'bg-green-100 text-green-700'}`}>
                            {r.source || 'auto'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
