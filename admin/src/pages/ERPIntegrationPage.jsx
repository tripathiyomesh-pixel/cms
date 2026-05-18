import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import api from '../services/api';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Download, Upload, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  success: 'text-green-600 bg-green-50',
  error:   'text-red-600 bg-red-50',
  failed:  'text-red-600 bg-red-50',
  unknown_event: 'text-amber-600 bg-amber-50',
};

export default function ERPIntegrationPage() {
  const { collapsed } = useOutletContext() || {};
  const [status,   setStatus]   = useState(null);
  const [logs,     setLogs]     = useState([]);
  const [syncing,  setSyncing]  = useState(false);
  const [pulling,  setPulling]  = useState(false);
  const [tab,      setTab]      = useState('status');
  const [settings, setSettings] = useState({ erp_api_url:'', erp_api_key:'', erp_sync_enabled:'false', erp_sync_interval:'15' });
  const [savingSettings, setSavingSettings] = useState(false);

  const loadStatus = async () => {
    try { const r=await api.get('/erp/status'); setStatus(r.data.data); } catch {}
  };
  const loadLogs = async () => {
    try { const r=await api.get('/erp/logs?limit=30'); setLogs(r.data.data||[]); } catch {}
  };
  const loadSettings = async () => {
    try {
      const r=await api.get('/settings');
      const d=r.data.data||[];
      const map={};
      d.forEach(s=>{ if(['erp_api_url','erp_api_key','erp_sync_enabled','erp_sync_interval'].includes(s.key)) map[s.key]=s.value; });
      setSettings(s=>({...s,...map}));
    } catch {}
  };

  useEffect(()=>{ loadStatus(); loadLogs(); loadSettings(); },[]);

  const handlePull = async () => {
    setPulling(true);
    try { const r=await api.post('/erp/sync/pull'); toast.success(r.data.data?.synced+' products synced'); loadStatus(); loadLogs(); }
    catch(e) { toast.error(e.response?.data?.message||'Pull failed'); }
    setPulling(false);
  };

  const handleFullSync = async () => {
    if(!confirm('Run full sync? This will pull ALL products from ERP. May take a few minutes.')) return;
    setSyncing(true);
    try { await api.post('/erp/sync/full'); toast.success('Full sync started in background. Check logs in a minute.'); }
    catch(e) { toast.error(e.response?.data?.message||'Sync failed'); }
    setSyncing(false);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.post('/settings/bulk',{ settings: Object.entries(settings).map(([key,value])=>({key,value:String(value)})) });
      toast.success('ERP settings saved. Restart backend to apply.');
    } catch { toast.error('Save failed'); }
    setSavingSettings(false);
  };

  const lbl='block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';
  const inp='input-field';

  const TABS = ['status','settings','logs'];

  return (
    <>
      <Topbar title="ERP Integration" subtitle="Vantix ERP ↔ JewelCMS sync"
        actions={
          <div className="flex gap-2">
            <button onClick={handlePull} disabled={pulling||!status?.configured}
              className="btn-outline flex items-center gap-1.5 text-xs disabled:opacity-40">
              <Download size={13} className={pulling?'animate-bounce':''}/>{pulling?'Pulling…':'Pull updates'}
            </button>
            <button onClick={handleFullSync} disabled={syncing||!status?.configured}
              className="btn-gold flex items-center gap-1.5 text-xs disabled:opacity-40">
              <RefreshCw size={13} className={syncing?'animate-spin':''}/>{syncing?'Running…':'Full sync'}
            </button>
          </div>
        }/>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Status banner */}
        {status && (
          <div className={`card p-4 mb-5 border-2 flex items-center gap-4 ${status.erp_online?'border-green-200 bg-green-50 dark:bg-green-900/10':status.configured?'border-amber-200 bg-amber-50 dark:bg-amber-900/10':'border-ink-200 bg-ink-50 dark:bg-ink-800/50'}`}>
            {status.erp_online ? <CheckCircle size={24} className="text-green-500 flex-shrink-0"/>
              : status.configured ? <AlertCircle size={24} className="text-amber-500 flex-shrink-0"/>
              : <XCircle size={24} className="text-ink-400 flex-shrink-0"/>}
            <div className="flex-1">
              <p className={`text-sm font-semibold ${status.erp_online?'text-green-700 dark:text-green-300':status.configured?'text-amber-700':'text-ink-500'}`}>
                {status.erp_online ? `ERP connected — ${status.erp_products} products synced from ERP`
                  : status.configured ? 'ERP configured but offline — check ERP_API_URL'
                  : 'ERP not configured — add credentials in Settings tab'}
              </p>
              {status.erp_url && <p className="text-xs text-ink-400 mt-0.5">{status.erp_url}</p>}
            </div>
            <div className="flex gap-6 flex-shrink-0 text-center">
              <div><div className="text-lg font-bold text-green-600">{status.stats?.success||0}</div><div className="text-[10px] text-ink-400">Successful syncs</div></div>
              <div><div className="text-lg font-bold text-red-500">{status.stats?.errors||0}</div><div className="text-[10px] text-ink-400">Errors</div></div>
              <div><div className="text-lg font-bold text-blue-600">{status.stats?.last_24h||0}</div><div className="text-[10px] text-ink-400">Last 24h</div></div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-ink-50 dark:bg-ink-800/50 p-1 rounded-xl w-fit">
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${tab===t?'bg-white dark:bg-ink-800 text-gold-600 shadow-sm':'text-ink-400 hover:text-ink-600'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Status tab */}
        {tab==='status' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Integration flow */}
            <div className="card p-5">
              <p className="text-xs font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-4">Integration flow</p>
              <div className="space-y-3">
                {[
                  { dir:'ERP → CMS', event:'product.created / product.updated', desc:'ERP webhook → CMS upserts product into DB', ok:status?.configured },
                  { dir:'ERP → CMS', event:'stock.changed',  desc:'ERP webhook → CMS updates stock_quantity + is_available', ok:status?.configured },
                  { dir:'ERP → CMS', event:'price.changed',  desc:'ERP webhook → CMS updates final_price + compare_price', ok:status?.configured },
                  { dir:'CMS → ERP', event:'Order created',  desc:'Checkout complete → CMS POSTs order to ERP → Sales Order created', ok:status?.configured },
                  { dir:'CMS pull',  event:'Scheduled sync', desc:`Every ${settings.erp_sync_interval||15} min → CMS pulls updated_since from ERP`, ok:status?.configured && settings.erp_sync_enabled==='true' },
                ].map((item,i)=>(
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-ink-50 dark:border-ink-800 last:border-0">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.ok?'bg-green-500':'bg-ink-300'}`}/>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold text-ink-400 uppercase">{item.dir}</span>
                        <span className="text-xs font-medium text-ink-700 dark:text-ink-200">{item.event}</span>
                      </div>
                      <p className="text-[11px] text-ink-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Webhook info */}
            <div className="card p-5">
              <p className="text-xs font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-4">Configure in Vantix ERP</p>
              <div className="space-y-3">
                <div className="bg-ink-50 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-[10px] text-ink-400 mb-1">Webhook URL (paste in ERP webhook settings)</p>
                  <code className="text-xs text-green-600 dark:text-green-400 font-mono break-all">
                    {window.location.origin.replace('3010','4000')}/api/erp/webhook
                  </code>
                </div>
                <div className="bg-ink-50 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-[10px] text-ink-400 mb-1">Signature header</p>
                  <code className="text-xs text-blue-600 font-mono">X-Webhook-Signature: sha256=HMAC_HASH</code>
                </div>
                <div className="bg-ink-50 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-[10px] text-ink-400 mb-1">Events to register</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['product.created','product.updated','product.deleted','stock.changed','price.changed'].map(e=>(
                      <span key={e} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono">{e}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-ink-50 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-[10px] text-ink-400 mb-1">CMS pull endpoint (register in ERP or Tasklet)</p>
                  <code className="text-xs text-purple-600 font-mono break-all">GET /api/v1/public/products?updated_since=TIMESTAMP</code>
                </div>
              </div>
            </div>

            {/* Data mapping */}
            <div className="card p-5 lg:col-span-2">
              <p className="text-xs font-bold text-ink-500 dark:text-ink-400 uppercase tracking-wide mb-4">Field mapping — ERP → CMS</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                {[
                  ['ERP: ecom_title',       'CMS: name'],
                  ['ERP: ecom_slug',         'CMS: slug'],
                  ['ERP: code',              'CMS: sku'],
                  ['ERP: id (uuid)',          'CMS: erp_id'],
                  ['ERP: web_price',          'CMS: final_price'],
                  ['ERP: web_compare_price', 'CMS: compare_price'],
                  ['ERP: in_stock',           'CMS: stock_quantity / is_available'],
                  ['ERP: hero_image',         'CMS: media (is_primary=true)'],
                  ['ERP: images[]',           'CMS: media[]'],
                  ['ERP: product_type',       'CMS: inventory_type'],
                  ['ERP: description_en',     'CMS: description'],
                  ['ERP: stone_carat/color',  'CMS: diamond_details'],
                ].map(([k,v],i)=>(
                  <div key={i} className="bg-ink-50 dark:bg-ink-800 rounded-lg p-2">
                    <div className="text-[10px] text-ink-400">{k}</div>
                    <div className="text-[10px] text-green-600 font-medium mt-0.5">→ {v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Settings tab */}
        {tab==='settings' && (
          <div className="max-w-xl space-y-4">
            <div><label className={lbl}>ERP API base URL</label>
              <input value={settings.erp_api_url} onChange={e=>setSettings(s=>({...s,erp_api_url:e.target.value}))}
                className={inp} placeholder="https://your-erp.domain.com"/></div>
            <div><label className={lbl}>ERP API key (X-API-Key header)</label>
              <input type="password" value={settings.erp_api_key} onChange={e=>setSettings(s=>({...s,erp_api_key:e.target.value}))}
                className={inp} placeholder="API key from ERP Settings → API Keys"/></div>
            <div><label className={lbl}>Webhook secret (HMAC-SHA256)</label>
              <input type="password" value={process.env.ERP_WEBHOOK_SECRET||'Set in .env: ERP_WEBHOOK_SECRET'}
                className={inp} readOnly placeholder="Set ERP_WEBHOOK_SECRET in .env file"/></div>

            <div className="flex items-center justify-between p-4 bg-ink-50 dark:bg-ink-800 rounded-xl">
              <div>
                <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Scheduled pull sync</p>
                <p className="text-xs text-ink-400">CMS automatically pulls updates from ERP</p>
              </div>
              <button onClick={()=>setSettings(s=>({...s,erp_sync_enabled:s.erp_sync_enabled==='true'?'false':'true'}))}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${settings.erp_sync_enabled==='true'?'bg-gold-500':'bg-ink-300 dark:bg-ink-600'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${settings.erp_sync_enabled==='true'?'translate-x-5':'translate-x-0.5'}`}/>
              </button>
            </div>

            {settings.erp_sync_enabled==='true' && (
              <div><label className={lbl}>Sync interval (minutes)</label>
                <select value={settings.erp_sync_interval} onChange={e=>setSettings(s=>({...s,erp_sync_interval:e.target.value}))} className={inp}>
                  {['5','10','15','30','60'].map(v=><option key={v} value={v}>Every {v} minutes</option>)}
                </select>
              </div>
            )}

            <button onClick={handleSaveSettings} disabled={savingSettings} className="btn-gold disabled:opacity-50">
              {savingSettings?'Saving…':'Save ERP settings'}
            </button>
            <p className="text-xs text-ink-400">Note: ERP_WEBHOOK_SECRET must be set in .env file and backend restarted to take effect.</p>
          </div>
        )}

        {/* Logs tab */}
        {tab==='logs' && (
          <div>
            <div className="flex justify-end mb-3">
              <button onClick={loadLogs} className="btn-ghost text-xs flex items-center gap-1.5"><RefreshCw size={12}/>Refresh</button>
            </div>
            <div className="card overflow-hidden">
              {logs.length===0 ? (
                <div className="py-12 text-center"><Activity size={32} className="mx-auto text-ink-200 mb-3"/><p className="text-sm text-ink-400">No sync logs yet</p></div>
              ) : logs.map((log,i)=>(
                <div key={log.id} className={`flex items-center gap-4 px-5 py-3 text-xs ${i%2===0?'':'bg-ink-50/50 dark:bg-ink-800/30'} ${i<logs.length-1?'border-b border-ink-100 dark:border-ink-800':''}`}>
                  <div className="flex-shrink-0 w-16 text-right">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[log.status]||'bg-ink-100 text-ink-500'}`}>{log.status}</span>
                  </div>
                  <div className="flex-shrink-0 w-24"><span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono">{log.direction||'in'}</span></div>
                  <div className="flex-1 font-medium text-ink-700 dark:text-ink-200 font-mono">{log.event_type}</div>
                  {log.error_message && <div className="flex-1 text-red-500 truncate">{log.error_message}</div>}
                  <div className="text-ink-400 flex-shrink-0">{log.created_at ? new Date(log.created_at).toLocaleString('en-AE') : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
