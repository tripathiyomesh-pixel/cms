import Toggle from '../components/ui/Toggle';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const MODULE_ICONS = {
  inventory:'ti-database', manufacturing:'ti-tools', operations:'ti-building-store',
  pricing:'ti-currency-dollar', crm:'ti-messages', commerce:'ti-shopping-cart',
  trust:'ti-certificate', cms:'ti-layout',
};

const MODULE_LABELS = {
  inventory:'Inventory', manufacturing:'Manufacturing', operations:'Operations',
  pricing:'Pricing', crm:'CRM', commerce:'Commerce', trust:'Trust', cms:'CMS',
};

export default function FeatureFlagsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const load = async() => {
    setLoading(true);
    try { const r=await api.get('/feature-flags'); setFlags(r.data.data||[]); }
    catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(()=>{ load(); },[]);

  const toggle = async(flag) => {
    setSaving(flag.flag_key);
    try {
      await api.patch(`/feature-flags/${flag.flag_key}`,{ is_enabled:!flag.is_enabled });
      setFlags(fs=>fs.map(f=>f.flag_key===flag.flag_key?{...f,is_enabled:!f.is_enabled}:f));
      toast.success(`${flag.label} ${!flag.is_enabled?'enabled':'disabled'}`);
    } catch { toast.error('Failed'); }
    setSaving(null);
  };

  const grouped = flags.reduce((acc,f)=>{
    const m=f.module||'other';
    if(!acc[m]) acc[m]=[];
    acc[m].push(f); return acc;
  },{});

  return (
    <>
      <Topbar title="Feature flags" subtitle="Enable or disable modules per client installation"/>

      <div className="flex-1 overflow-y-auto p-5">
        {loading ? <p className="text-sm text-ink-400">Loading…</p> : (
          <div className="space-y-4">
            <div className="card p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <div className="flex gap-2 items-start">
                <i className="ti ti-info-circle text-amber-600 text-base mt-0.5" aria-hidden="true"/>
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                  Feature flags control which modules are enabled for this client installation. Disabling a module hides its menu items and API routes. The database tables remain intact — data is preserved.
                </p>
              </div>
            </div>

            {Object.entries(grouped).map(([module, moduleFlags])=>(
              <div key={module} className="card overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-200/60 dark:border-ink-700 bg-ink-50/50 dark:bg-ink-800/30">
                  <i className={`ti ${MODULE_ICONS[module]||'ti-puzzle'} text-gold-500`} style={{fontSize:15}} aria-hidden="true"/>
                  <span className="text-sm font-medium text-ink-700 dark:text-ink-200">{MODULE_LABELS[module]||module}</span>
                  <span className="text-xs text-ink-400 ml-1">({moduleFlags.filter(f=>f.is_enabled).length}/{moduleFlags.length} enabled)</span>
                </div>
                <div>
                  {moduleFlags.map((f,i)=>(
                    <div key={f.flag_key}
                      className={`flex items-center justify-between px-4 py-3 ${i%2===0?'':'bg-ink-50/30 dark:bg-ink-800/20'} ${i<moduleFlags.length-1?'border-b border-ink-100 dark:border-ink-800':''}`}>
                      <div>
                        <p className="text-sm text-ink-700 dark:text-ink-200">{f.label}</p>
                        <p className="text-[10px] font-mono text-ink-400">{f.flag_key}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {saving===f.flag_key && <span className="w-3 h-3 border border-ink-300 border-t-gold-500 rounded-full animate-spin"/>}
                        <Toggle checked={!!f.is_enabled} onChange={()=>toggle(f)} disabled={saving===f.flag_key}/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
