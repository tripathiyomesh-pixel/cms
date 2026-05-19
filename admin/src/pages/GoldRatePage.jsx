import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import api from '../services/api';
import { RefreshCw, Save, TrendingUp, TrendingDown, Minus, History, Shield, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CAPABILITIES = [
  { group:'Dashboard',   caps:['dashboard.view'] },
  { group:'Products',    caps:['products.view','products.create','products.edit','products.delete','products.publish'] },
  { group:'Diamonds',    caps:['diamonds.view','diamonds.create','diamonds.edit','diamonds.delete'] },
  { group:'Gemstones',   caps:['gemstones.view','gemstones.create','gemstones.edit','gemstones.delete'] },
  { group:'Inventory',   caps:['inventory.view','inventory.manage','inventory.import'] },
  { group:'Orders',      caps:['orders.view','orders.create','orders.manage','orders.approve'] },
  { group:'Enquiries',   caps:['enquiries.view','enquiries.manage','enquiries.assign'] },
  { group:'Appointments',caps:['appointments.view','appointments.create','appointments.manage'] },
  { group:'Customers',   caps:['customers.view','customers.create','customers.edit','customers.delete'] },
  { group:'Exhibitions', caps:['exhibitions.view','exhibitions.manage'] },
  { group:'Marketing',   caps:['marketing.view','marketing.manage'] },
  { group:'Blog',        caps:['blog.view','blog.manage'] },
  { group:'Media',       caps:['media.view','media.manage'] },
  { group:'Builder',     caps:['builder.view','builder.manage'] },
  { group:'Settings',    caps:['settings.view','settings.manage'] },
  { group:'Users',       caps:['users.view','users.manage','workforce.view','workforce.manage'] },
  { group:'Reports',     caps:['reports.view','reports.export'] },
  { group:'Suppliers',   caps:['suppliers.view','suppliers.manage'] },
  { group:'ERP',         caps:['erp.view','erp.manage'] },
  { group:'Payments',    caps:['payments.view','payments.manage'] },
  { group:'Gold Rates',  caps:['gold_rates.view','gold_rates.manage'] },
];

const ROLE_COLORS = {
  super_admin:'purple', admin:'blue', boutique_manager:'amber',
  sales_staff:'green', inventory_staff:'orange', marketing_staff:'pink',
  crm_staff:'teal', accountant:'yellow', viewer:'gray',
};

const lbl = 'block text-[11px] font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-1.5';
const inp = 'input-field text-sm';

// ── GOLD RATE DISPLAY ─────────────────────────────────────────
function GoldRateCard({ purity, rate, prev, label }) {
  const change = prev ? rate - prev : 0;
  const Icon = change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus;
  const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-500' : 'text-ink-400';

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-bold text-ink-800 dark:text-ink-100">AED {rate?.toFixed(2)}</p>
          <p className="text-[11px] text-ink-400 mt-0.5">per gram</p>
        </div>
        <div className={`flex items-center gap-1 ${changeColor}`}>
          <Icon size={14}/>
          <span className="text-xs font-semibold">{change > 0 ? '+' : ''}{change.toFixed(2)}</span>
        </div>
      </div>
      <div className="h-0.5 rounded-full" style={{ background: `linear-gradient(to right, #b8860b, #d4a843)`, opacity: 0.4 }}/>
    </div>
  );
}

// ── ROLE EDITOR ────────────────────────────────────────────────
function RoleEditor({ role, onClose, onSaved }) {
  const [caps, setCaps] = useState({ ...role.capabilities });
  const [saving, setSaving] = useState(false);

  const toggle = (cap) => setCaps(c => ({ ...c, [cap]: !c[cap] }));

  const save = async () => {
    setSaving(true);
    try {
      await api.put(`/gold-rates/roles/${role.role}`, { capabilities: caps });
      toast.success(`${role.label} permissions updated`);
      onSaved();
      onClose();
    } catch(e) { toast.error('Failed to save'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-ink-900 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 dark:border-ink-800">
          <div>
            <h3 className="text-base font-bold text-ink-700 dark:text-ink-200">Edit: {role.label}</h3>
            <p className="text-xs text-ink-400">{role.description}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400"><X size={16}/></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {CAPABILITIES.map(group => (
            <div key={group.group}>
              <p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-2">{group.group}</p>
              <div className="flex flex-wrap gap-2">
                {group.caps.map(cap => (
                  <button key={cap} onClick={() => toggle(cap)}
                    className={`text-[11px] px-3 py-1.5 rounded-full border font-medium transition-all ${caps[cap] ? 'bg-gold-500 border-gold-500 text-white' : 'border-ink-200 dark:border-ink-700 text-ink-500 hover:border-gold-300'}`}>
                    {cap}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-ink-100 dark:border-ink-800 flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center text-xs">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-gold flex-1 justify-center text-xs">
            {saving ? 'Saving…' : 'Save permissions'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────
export default function GoldRatePage() {
  const { collapsed } = useOutletContext()||{};
  const [tab,        setTab]        = useState('gold');
  const [current,    setCurrent]    = useState(null);
  const [history,    setHistory]    = useState([]);
  const [roles,      setRoles]      = useState([]);
  const [scraping,   setScraping]   = useState(false);
  const [editRole,   setEditRole]   = useState(null);
  const [manual,     setManual]     = useState({ rate_24k:'', rate_22k:'', rate_21k:'', rate_18k:'' });

  const loadGold = () => {
    api.get('/gold-rates/current').then(r => {
      setCurrent(r.data.data);
      if (r.data.data) {
        setManual({
          rate_24k: r.data.data.rate_24k || '',
          rate_22k: r.data.data.rate_22k || '',
          rate_21k: r.data.data.rate_21k || '',
          rate_18k: r.data.data.rate_18k || '',
        });
      }
    }).catch(()=>{});
    api.get('/gold-rates/history').then(r => setHistory(r.data.data||[])).catch(()=>{});
  };

  const loadRoles = () => {
    api.get('/gold-rates/roles').then(r => setRoles(r.data.data||[])).catch(()=>{});
  };

  useEffect(() => { loadGold(); loadRoles(); }, []);

  // Auto-derive lower karats from 24k
  const handle24k = (v) => {
    const r24 = parseFloat(v);
    if (r24 > 0) {
      setManual({
        rate_24k: v,
        rate_22k: (r24 * 22/24).toFixed(2),
        rate_21k: (r24 * 21/24).toFixed(2),
        rate_18k: (r24 * 18/24).toFixed(2),
      });
    } else {
      setManual(m => ({ ...m, rate_24k: v }));
    }
  };

  const saveManual = async () => {
    if (!manual.rate_24k) return toast.error('Enter 24K rate');
    try {
      await api.post('/gold-rates/manual', manual);
      toast.success('Gold rate updated');
      loadGold();
    } catch { toast.error('Failed to save'); }
  };

  const scrapeNow = async () => {
    setScraping(true);
    try {
      const res = await api.post('/gold-rates/scrape');
      toast.success(`Fetched from ${res.data.data?.source || 'web'}`);
      loadGold();
    } catch(e) {
      toast.error(e.response?.data?.message || 'Scraping failed — check internet');
    }
    setScraping(false);
  };

  const prev = history?.[1];

  return (
    <>
      <Topbar title="Gold rates & permissions"
        subtitle="Live Dubai gold rates + dynamic role permissions"
        actions={
          tab === 'gold' && (
            <button onClick={scrapeNow} disabled={scraping}
              className="btn-ghost flex items-center gap-1.5 text-xs disabled:opacity-50">
              <RefreshCw size={13} className={scraping ? 'animate-spin' : ''}/>
              {scraping ? 'Fetching…' : 'Fetch from web'}
            </button>
          )
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-ink-200/60 dark:border-ink-800 px-6 bg-white dark:bg-ink-900 flex-shrink-0">
        {[['gold','Gold Rates',TrendingUp],['roles','Role Permissions',Shield]].map(([id,label,Icon])=>(
          <button key={id} onClick={()=>setTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${tab===id?'border-gold-500 text-gold-600':'border-transparent text-ink-400 hover:text-ink-600'}`}>
            <Icon size={14}/>{label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">

        {/* ── GOLD RATES TAB ─────────────────────────────────── */}
        {tab === 'gold' && (
          <div className="max-w-4xl space-y-6">
            {/* Current rates */}
            {current && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Current rates — AED per gram</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-ink-400">Source: {current.source}</span>
                      <span className="text-[10px] text-ink-400">·</span>
                      <span className="text-[10px] text-ink-400">{new Date(current.fetched_at).toLocaleString('en-AE',{timeZone:'Asia/Dubai'})}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <GoldRateCard purity="24K" label="24 Karat (Pure)" rate={parseFloat(current.rate_24k)} prev={parseFloat(prev?.rate_24k||0)}/>
                    <GoldRateCard purity="22K" label="22 Karat" rate={parseFloat(current.rate_22k)} prev={parseFloat(prev?.rate_22k||0)}/>
                    <GoldRateCard purity="21K" label="21 Karat" rate={parseFloat(current.rate_21k)} prev={0}/>
                    <GoldRateCard purity="18K" label="18 Karat" rate={parseFloat(current.rate_18k)} prev={parseFloat(prev?.rate_18k||0)}/>
                  </div>
                </div>

                {/* Pricing formula display */}
                <div className="card p-5 bg-gold-50 dark:bg-gold-900/10 border-gold-200 dark:border-gold-800">
                  <p className="text-xs font-bold text-gold-700 dark:text-gold-400 mb-3 uppercase tracking-wide">How jewellery price is calculated</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-white dark:bg-ink-800 rounded-xl">
                      <p className="text-[10px] text-ink-400 mb-1">Gold value</p>
                      <p className="text-sm font-bold text-ink-700 dark:text-ink-200">Weight × Rate</p>
                      <p className="text-[11px] text-ink-400 mt-1">e.g. 10g × AED {parseFloat(current.rate_22k).toFixed(0)} = AED {(10*parseFloat(current.rate_22k)).toFixed(0)}</p>
                    </div>
                    <div className="flex items-center justify-center text-2xl text-ink-300">+</div>
                    <div className="p-3 bg-white dark:bg-ink-800 rounded-xl">
                      <p className="text-[10px] text-ink-400 mb-1">Making charge</p>
                      <p className="text-sm font-bold text-ink-700 dark:text-ink-200">Gold value × Making%</p>
                      <p className="text-[11px] text-ink-400 mt-1">e.g. 12% = AED {(10*parseFloat(current.rate_22k)*0.12).toFixed(0)}</p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-gold-500/10 rounded-xl text-center">
                    <p className="text-xs font-bold text-gold-700 dark:text-gold-400">
                      Final price = AED {(10*parseFloat(current.rate_22k) + 10*parseFloat(current.rate_22k)*0.12).toFixed(0)} (10g 22K ring at 12% making charge)
                    </p>
                    <p className="text-[10px] text-gold-600 mt-1">Updates automatically when gold rate changes</p>
                  </div>
                </div>
              </>
            )}

            {/* Manual update */}
            <div className="card p-5">
              <p className={lbl + ' mb-4'}>Manual rate entry (AED per gram)</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className={lbl}>24K (Pure gold)</label>
                  <input type="number" step="0.25" value={manual.rate_24k} onChange={e=>handle24k(e.target.value)} className={inp} placeholder="547.00"/>
                  <p className="text-[10px] text-ink-400 mt-1">Others auto-calculate</p>
                </div>
                <div>
                  <label className={lbl}>22K</label>
                  <input type="number" step="0.25" value={manual.rate_22k} onChange={e=>setManual(m=>({...m,rate_22k:e.target.value}))} className={inp} placeholder="524.75"/>
                </div>
                <div>
                  <label className={lbl}>21K</label>
                  <input type="number" step="0.25" value={manual.rate_21k} onChange={e=>setManual(m=>({...m,rate_21k:e.target.value}))} className={inp} placeholder="500.00"/>
                </div>
                <div>
                  <label className={lbl}>18K</label>
                  <input type="number" step="0.25" value={manual.rate_18k} onChange={e=>setManual(m=>({...m,rate_18k:e.target.value}))} className={inp} placeholder="410.25"/>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={saveManual} className="btn-gold flex items-center gap-1.5 text-xs"><Save size={12}/> Save rate</button>
                <button onClick={scrapeNow} disabled={scraping} className="btn-ghost flex items-center gap-1.5 text-xs disabled:opacity-50">
                  <RefreshCw size={12} className={scraping?'animate-spin':''}/> Fetch from Dubai City of Gold
                </button>
              </div>
            </div>

            {/* Rate history */}
            {history.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3 flex items-center gap-2"><History size={12}/> Rate history</p>
                <div className="card overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="border-b border-ink-100 dark:border-ink-800">
                      {['Date & Time','24K','22K','18K','Source'].map(h=><th key={h} className="text-left text-[10px] font-bold text-ink-400 uppercase tracking-wider px-4 py-3">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-ink-50 dark:divide-ink-800">
                      {history.slice(0,15).map(r=>(
                        <tr key={r.id} className="hover:bg-ink-50 dark:hover:bg-ink-800/50">
                          <td className="px-4 py-2.5 text-xs text-ink-500">{new Date(r.recorded_at).toLocaleString('en-AE',{timeZone:'Asia/Dubai',hour12:true})}</td>
                          <td className="px-4 py-2.5 text-sm font-semibold text-gold-600">{parseFloat(r.rate_24k).toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-sm text-ink-600 dark:text-ink-300">{parseFloat(r.rate_22k).toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-sm text-ink-600 dark:text-ink-300">{parseFloat(r.rate_18k).toFixed(2)}</td>
                          <td className="px-4 py-2.5 text-xs text-ink-400">{r.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ROLE PERMISSIONS TAB ───────────────────────────── */}
        {tab === 'roles' && (
          <div className="max-w-4xl space-y-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl mb-5">
              <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                <strong>Dynamic permissions:</strong> These role capabilities are stored in the database. 
                Changes apply immediately to all users with that role — no code changes needed. 
                Staff with custom policies on top of their role will have those policies applied additionally.
              </p>
            </div>

            {roles.map(role=>{
              const color = ROLE_COLORS[role.role] || 'gray';
              const grantedCount = Object.values(role.capabilities||{}).filter(Boolean).length;
              return (
                <div key={role.id} className="card p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}>
                        <Shield size={16} className={`text-${color}-600 dark:text-${color}-400`}/>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-ink-700 dark:text-ink-200">{role.label}</p>
                          {role.is_system && <span className="text-[9px] bg-ink-100 dark:bg-ink-800 text-ink-400 px-1.5 py-0.5 rounded-full font-semibold">System</span>}
                        </div>
                        <p className="text-xs text-ink-400">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-ink-400">{grantedCount} permissions</span>
                      <button onClick={()=>setEditRole(role)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-ink-200 dark:border-ink-700 rounded-lg hover:border-gold-400 text-ink-500 hover:text-gold-600 transition-colors">
                        <Edit2 size={11}/> Edit
                      </button>
                    </div>
                  </div>
                  {/* Permission preview */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(role.capabilities||{}).filter(([,v])=>v).slice(0,8).map(([cap])=>(
                      <span key={cap} className="text-[9px] px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400 font-medium">{cap}</span>
                    ))}
                    {Object.values(role.capabilities||{}).filter(Boolean).length > 8 && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 font-medium">
                        +{Object.values(role.capabilities||{}).filter(Boolean).length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editRole && <RoleEditor role={editRole} onClose={()=>setEditRole(null)} onSaved={loadRoles}/>}
    </>
  );
}
