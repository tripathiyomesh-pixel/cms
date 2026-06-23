import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import api from '../services/api';
import { RefreshCw, CheckCircle, XCircle, AlertCircle, Download, Upload, Activity, ShoppingCart, Package } from 'lucide-react';
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
  const [purchaseLogs, setPurchaseLogs] = useState([]);
  const [saleLogs,     setSaleLogs]     = useState([]);
  const [pushingPurchase, setPushingPurchase] = useState(null);
  const [pushingSale,     setPushingSale]     = useState(null);

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
      d.forEach(s=>{ if(['erp_api_url','erp_api_key','erp_sync_enabled','erp_sync_interval'].includes(s.key)) map[s.key]=s.value?.replace(/^"|"$/g,'')||''; });
      setSettings(s=>({...s,...map}));
    } catch {}
  };
  const loadPurchaseLogs = async () => {
    try { const r=await api.get('/erp/logs?direction=outbound&type=purchase&limit=20'); setPurchaseLogs(r.data.data||[]); } catch {}
  };
  const loadSaleLogs = async () => {
    try { const r=await api.get('/erp/logs?direction=outbound&type=sale&limit=20'); setSaleLogs(r.data.data||[]); } catch {}
  };

  useEffect(()=>{ loadStatus(); loadLogs(); loadSettings(); loadPurchaseLogs(); loadSaleLogs(); },[]);

  const handlePull = async () => {
    setPulling(true);
    try { const r=await api.post('/erp/sync/pull'); toast.success((r.data.data?.synced||0)+' products synced'); loadStatus(); loadLogs(); }
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

  const pushPurchase = async (id) => {
    setPushingPurchase(id);
    try { await api.post(`/erp/push/purchase/${id}`); toast.success('Purchase order pushed to ERP'); loadPurchaseLogs(); }
    catch(e) { toast.error(e.response?.data?.message||'Push failed'); }
    setPushingPurchase(null);
  };

  const pushSale = async (id) => {
    setPushingSale(id);
    try { await api.post(`/erp/push/sale/${id}`); toast.success('Sale pushed to ERP'); loadSaleLogs(); }
    catch(e) { toast.error(e.response?.data?.message||'Push failed'); }
    setPushingSale(null);
  };

  const lbl='block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';
  const inp='input-field';

  const TABS = [
    { id:'status',   label:'Status & flow' },
    { id:'purchases',label:'Purchases → ERP' },
    { id:'sales',    label:'Sales → ERP' },
    { id:'settings', label:'Settings' },
    { id:'logs',     label:'Sync logs' },
  ];

  return (
    <>
      <Topbar title="ERP Integration" subtitle="Vantix ERP ↔ JCOS sync"
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
                {status.erp_online ? `ERP connected — ${status.erp_products||0} products synced`
                  : status.configured ? 'ERP configured but offline — check ERP_API_URL'
                  : 'ERP not configured — add credentials in Settings tab'}
              </p>
              {status.erp_url && <p className="text-xs text-ink-400 mt-0.5">{status.erp_url}</p>}
            </div>
            <div className="flex gap-6 flex-shrink-0 text-center">
              <div><div className="text-lg font-bold text-green-600">{status.stats?.success||0}</div><div className="text-[10px] text-ink-400">OK syncs</div></div>
              <div><div className="text-lg font-bold text-red-500">{status.stats?.errors||0}</div><div className="text-[10px] text-ink-400">Errors</div></div>
              <div><div className="text-lg font-bold text-blue-600">{status.stats?.last_24h||0}</div><div className="text-[10px] text-ink-400">Last 24h</div></div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-ink-50 dark:bg-ink-800/50 p-1 rounded-xl w-fit flex-wrap">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${tab===t.id?'bg-white dark:bg-ink-800 text-gold-600 shadow-sm':'text-ink-400 hover:text-ink-600'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* STATUS TAB */}
        {tab==='status' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="card p-5">
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wide mb-4">Integration flow</p>
              <div className="space-y-3">
                {[
                  { dir:'ERP → CMS', event:'product.created / updated', desc:'ERP webhook → CMS upserts product into DB', ok:status?.configured },
                  { dir:'ERP → CMS', event:'stock.changed',             desc:'ERP webhook → CMS updates stock_quantity + is_available', ok:status?.configured },
                  { dir:'ERP → CMS', event:'price.changed',             desc:'ERP webhook → CMS updates final_price + compare_price', ok:status?.configured },
                  { dir:'CMS → ERP', event:'Purchase order created',    desc:'Admin creates purchase → CMS POSTs Purchase Order to ERP', ok:status?.configured },
                  { dir:'CMS → ERP', event:'Sale / enquiry converted',  desc:'Enquiry converted to order → CMS POSTs Sale Order to ERP', ok:status?.configured },
                  { dir:'CMS pull',  event:'Scheduled pull',            desc:`Every ${settings.erp_sync_interval||15} min → CMS pulls updated_since from ERP`, ok:settings.erp_sync_enabled==='true' },
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

            <div className="card p-5">
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wide mb-4">Configure in Vantix ERP</p>
              <div className="space-y-3">
                <div className="bg-ink-50 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-[10px] text-ink-400 mb-1">Webhook URL (paste in ERP)</p>
                  <code className="text-xs text-green-600 dark:text-green-400 font-mono break-all">
                    {typeof window !== 'undefined' ? window.location.origin.replace(':3010',':4000') : 'http://localhost:4000'}/api/erp/webhook
                  </code>
                </div>
                <div className="bg-ink-50 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-[10px] text-ink-400 mb-1">Signature header</p>
                  <code className="text-xs text-blue-600 font-mono">X-Webhook-Signature: sha256=HMAC_HASH</code>
                </div>
                <div className="bg-ink-50 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-[10px] text-ink-400 mb-1">Register these webhook events</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {['product.created','product.updated','product.deleted','stock.changed','price.changed'].map(e=>(
                      <span key={e} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono">{e}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-ink-50 dark:bg-ink-800 rounded-xl p-3">
                  <p className="text-[10px] text-ink-400 mb-1">ERP endpoints JCOS calls</p>
                  <div className="space-y-1">
                    <code className="text-[10px] text-purple-600 font-mono block">POST /api/v1/purchases — create purchase order</code>
                    <code className="text-[10px] text-purple-600 font-mono block">POST /api/v1/sales — create sale / sales order</code>
                    <code className="text-[10px] text-purple-600 font-mono block">GET  /api/v1/public/products?updated_since=T — pull sync</code>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-5 lg:col-span-2">
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wide mb-4">Field mapping — ERP → CMS</p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                {[
                  ['ERP: ecom_title','CMS: name'],['ERP: ecom_slug','CMS: slug'],
                  ['ERP: code','CMS: sku'],['ERP: id','CMS: erp_id'],
                  ['ERP: web_price','CMS: final_price'],['ERP: web_compare_price','CMS: compare_price'],
                  ['ERP: in_stock','CMS: stock_quantity / is_available'],['ERP: hero_image','CMS: media (primary)'],
                  ['ERP: product_type','CMS: inventory_type'],['ERP: description_en','CMS: description'],
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

        {/* PURCHASES TAB */}
        {tab==='purchases' && (
          <div className="space-y-4">
            <div className="card p-4 border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10">
              <div className="flex items-center gap-2 mb-2">
                <Package size={14} className="text-blue-500"/>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Purchase → ERP sync</p>
              </div>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">
                When a purchase order is created in JCOS (Inventory → Purchases), it is automatically pushed to Vantix ERP as a Purchase Order. Failed pushes appear below and can be retried manually.
              </p>
            </div>

            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between">
                <span className="text-xs font-medium text-ink-600 dark:text-ink-300">Recent purchase sync events</span>
                <button onClick={loadPurchaseLogs} className="btn-ghost text-xs flex items-center gap-1"><RefreshCw size={11}/>Refresh</button>
              </div>
              {purchaseLogs.length === 0 ? (
                <div className="py-10 text-center">
                  <Package size={28} className="mx-auto text-ink-200 mb-2"/>
                  <p className="text-sm text-ink-400">No purchase sync events yet</p>
                  <p className="text-xs text-ink-400 mt-1">They appear here when purchases are pushed to ERP</p>
                </div>
              ) : (
                <div className="divide-y divide-ink-100 dark:divide-ink-800">
                  {purchaseLogs.map((log,i)=>(
                    <div key={log.id||i} className="flex items-center gap-4 px-5 py-3 text-xs hover:bg-ink-50/50 dark:hover:bg-ink-800/30">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[log.status]||'bg-ink-100 text-ink-500'}`}>{log.status}</span>
                      <span className="font-mono text-ink-600 dark:text-ink-300 flex-1">{log.event_type}</span>
                      {log.error_message && <span className="text-red-500 flex-1 truncate">{log.error_message}</span>}
                      <span className="text-ink-400 flex-shrink-0">{log.created_at ? new Date(log.created_at).toLocaleString('en-AE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : ''}</span>
                      {log.status === 'failed' && log.resource_id && (
                        <button onClick={() => pushPurchase(log.resource_id)} disabled={pushingPurchase===log.resource_id}
                          className="btn-ghost text-xs flex items-center gap-1 text-blue-600 disabled:opacity-50">
                          <Upload size={11}/>{pushingPurchase===log.resource_id?'Pushing…':'Retry'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Manual trigger */}
            <div className="card p-5">
              <p className="text-xs font-semibold text-ink-600 dark:text-ink-300 mb-3">Manual push</p>
              <p className="text-[11px] text-ink-400 mb-4">Enter a purchase order ID to manually push it to ERP:</p>
              <PushManualForm type="purchase" onPush={pushPurchase} pushing={pushingPurchase}/>
            </div>
          </div>
        )}

        {/* SALES TAB */}
        {tab==='sales' && (
          <div className="space-y-4">
            <div className="card p-4 border border-green-100 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart size={14} className="text-green-500"/>
                <p className="text-xs font-semibold text-green-700 dark:text-green-300">Sale → ERP sync</p>
              </div>
              <p className="text-[11px] text-green-600 dark:text-green-400 leading-relaxed">
                When a sale or enquiry is converted to an order in JCOS, it is automatically pushed to Vantix ERP as a Sales Order. The ERP then handles invoicing, delivery notes, and stock deduction.
              </p>
            </div>

            <div className="card overflow-hidden">
              <div className="px-5 py-3 border-b border-ink-100 dark:border-ink-800 flex items-center justify-between">
                <span className="text-xs font-medium text-ink-600 dark:text-ink-300">Recent sale sync events</span>
                <button onClick={loadSaleLogs} className="btn-ghost text-xs flex items-center gap-1"><RefreshCw size={11}/>Refresh</button>
              </div>
              {saleLogs.length === 0 ? (
                <div className="py-10 text-center">
                  <ShoppingCart size={28} className="mx-auto text-ink-200 mb-2"/>
                  <p className="text-sm text-ink-400">No sale sync events yet</p>
                  <p className="text-xs text-ink-400 mt-1">They appear here when orders are pushed to ERP</p>
                </div>
              ) : (
                <div className="divide-y divide-ink-100 dark:divide-ink-800">
                  {saleLogs.map((log,i)=>(
                    <div key={log.id||i} className="flex items-center gap-4 px-5 py-3 text-xs hover:bg-ink-50/50 dark:hover:bg-ink-800/30">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[log.status]||'bg-ink-100 text-ink-500'}`}>{log.status}</span>
                      <span className="font-mono text-ink-600 dark:text-ink-300 flex-1">{log.event_type}</span>
                      {log.error_message && <span className="text-red-500 flex-1 truncate">{log.error_message}</span>}
                      <span className="text-ink-400 flex-shrink-0">{log.created_at ? new Date(log.created_at).toLocaleString('en-AE',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}) : ''}</span>
                      {log.status === 'failed' && log.resource_id && (
                        <button onClick={() => pushSale(log.resource_id)} disabled={pushingSale===log.resource_id}
                          className="btn-ghost text-xs flex items-center gap-1 text-green-600 disabled:opacity-50">
                          <Upload size={11}/>{pushingSale===log.resource_id?'Pushing…':'Retry'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card p-5">
              <p className="text-xs font-semibold text-ink-600 dark:text-ink-300 mb-3">Manual push</p>
              <p className="text-[11px] text-ink-400 mb-4">Enter an order ID to manually push it to ERP:</p>
              <PushManualForm type="sale" onPush={pushSale} pushing={pushingSale}/>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab==='settings' && (
          <div className="max-w-xl space-y-4">
            <div>
              <label className={lbl}>ERP API base URL</label>
              <input value={settings.erp_api_url} onChange={e=>setSettings(s=>({...s,erp_api_url:e.target.value}))}
                className={inp} placeholder="https://your-erp.domain.com"/>
            </div>
            <div>
              <label className={lbl}>ERP API key (X-API-Key header)</label>
              <input type="password" value={settings.erp_api_key} onChange={e=>setSettings(s=>({...s,erp_api_key:e.target.value}))}
                className={inp} placeholder="API key from ERP Settings → API Keys"/>
            </div>
            <div>
              <label className={lbl}>Webhook secret</label>
              <input value="Set ERP_WEBHOOK_SECRET in backend .env" className={inp} readOnly/>
              <p className="text-[10px] text-ink-400 mt-1">Cannot be edited here — set in server .env file and restart backend</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-ink-50 dark:bg-ink-800 rounded-xl">
              <div>
                <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Scheduled pull sync</p>
                <p className="text-xs text-ink-400">CMS automatically pulls product updates from ERP</p>
              </div>
              <button onClick={()=>setSettings(s=>({...s,erp_sync_enabled:s.erp_sync_enabled==='true'?'false':'true'}))}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${settings.erp_sync_enabled==='true'?'bg-gold-500':'bg-ink-300 dark:bg-ink-600'}`}>
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${settings.erp_sync_enabled==='true'?'translate-x-5':'translate-x-0.5'}`}/>
              </button>
            </div>

            {settings.erp_sync_enabled==='true' && (
              <div>
                <label className={lbl}>Sync interval</label>
                <select value={settings.erp_sync_interval} onChange={e=>setSettings(s=>({...s,erp_sync_interval:e.target.value}))} className={inp}>
                  {['5','10','15','30','60'].map(v=><option key={v} value={v}>Every {v} minutes</option>)}
                </select>
              </div>
            )}

            <button onClick={handleSaveSettings} disabled={savingSettings} className="btn-gold disabled:opacity-50">
              {savingSettings?'Saving…':'Save ERP settings'}
            </button>
            <p className="text-xs text-ink-400">Webhook secret and API changes require backend restart to take effect.</p>
          </div>
        )}

        {/* LOGS TAB */}
        {tab==='logs' && (
          <div>
            <div className="flex justify-end mb-3">
              <button onClick={loadLogs} className="btn-ghost text-xs flex items-center gap-1.5"><RefreshCw size={12}/>Refresh</button>
            </div>
            <div className="card overflow-hidden">
              {logs.length===0 ? (
                <div className="py-12 text-center"><Activity size={32} className="mx-auto text-ink-200 mb-3"/><p className="text-sm text-ink-400">No sync logs yet</p></div>
              ) : logs.map((log,i)=>(
                <div key={log.id||i} className={`flex items-center gap-4 px-5 py-3 text-xs ${i%2===0?'':'bg-ink-50/50 dark:bg-ink-800/30'} ${i<logs.length-1?'border-b border-ink-100 dark:border-ink-800':''}`}>
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

function PushManualForm({ type, onPush, pushing }) {
  const [id, setId] = useState('');
  return (
    <div className="flex gap-2 max-w-md">
      <input value={id} onChange={e=>setId(e.target.value)}
        className="input-field text-sm flex-1" placeholder={`${type === 'purchase' ? 'Purchase' : 'Order'} ID (UUID)`}/>
      <button onClick={() => { if(id.trim()) { onPush(id.trim()); setId(''); } }} disabled={!id.trim() || pushing===id.trim()}
        className="btn-gold text-xs flex items-center gap-1.5 disabled:opacity-50">
        <Upload size={12}/> Push to ERP
      </button>
    </div>
  );
}
