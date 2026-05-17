import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import api from '../services/api';
import { Save, ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RapNetSettingsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [status, setStatus]   = useState(null);
  const [saving, setSaving]   = useState(false);
  const [testing, setTesting] = useState(false);
  const [form, setForm]       = useState({ RAPNET_TOKEN:'', RAPNET_MARKUP_PCT:'5' });

  const checkStatus = async() => {
    try { const r=await api.get('/rapnet/status'); setStatus(r.data.data); }
    catch { setStatus({ configured:false }); }
  };

  useEffect(()=>{ checkStatus(); },[]);

  const handleSave = async() => {
    setSaving(true);
    try {
      await api.post('/settings/bulk',{ settings:[
        { key:'RAPNET_TOKEN',      value:form.RAPNET_TOKEN },
        { key:'RAPNET_MARKUP_PCT', value:form.RAPNET_MARKUP_PCT },
      ]});
      toast.success('RapNet settings saved. Restart backend to apply token.');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const testConnection = async() => {
    setTesting(true);
    try {
      const r=await api.get('/rapnet/diamonds?size_from=0.5&size_to=1&page_number=1&page_size=1');
      if(r.data.success) { toast.success(`RapNet connected — ${r.data.data.total} diamonds available`); }
      else { toast.error('RapNet connection failed'); }
    } catch(e) {
      const msg=e.response?.data?.message||'Connection failed';
      if(msg.includes('RAPNET_TOKEN')) toast.error('Token not set. Add RAPNET_TOKEN to your .env file and restart backend.');
      else toast.error(msg);
    }
    setTesting(false);
  };

  const inp='input-field';
  const lbl='block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';

  return (
    <>
      <Topbar title="RapNet settings" subtitle="Instant Inventory integration — live diamond feed"/>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-2xl space-y-4">

          {/* Status card */}
          <div className={`card p-5 border-2 ${status?.configured?'border-green-200 bg-green-50 dark:bg-green-900/10':'border-amber-200 bg-amber-50 dark:bg-amber-900/10'}`}>
            <div className="flex items-center gap-3">
              {status?.configured ? <CheckCircle size={24} className="text-green-500"/> : <XCircle size={24} className="text-amber-500"/>}
              <div>
                <p className={`text-sm font-semibold ${status?.configured?'text-green-700 dark:text-green-300':'text-amber-700 dark:text-amber-300'}`}>
                  {status?.configured ? 'RapNet connected' : 'RapNet not configured'}
                </p>
                <p className="text-xs text-ink-400 mt-0.5">
                  {status?.configured ? `Token set · Markup: ${status?.markup_pct}% · ${status?.note}` : 'Set RAPNET_TOKEN in your .env file to activate'}
                </p>
              </div>
              <button onClick={checkStatus} className="ml-auto p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800 text-ink-400">
                <RefreshCw size={14}/>
              </button>
            </div>
          </div>

          {/* What is RapNet */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3">What is RapNet Instant Inventory?</h3>
            <div className="text-xs text-ink-500 space-y-2 leading-relaxed">
              <p>RapNet Instant Inventory lets your website show <strong>thousands of diamonds from global suppliers</strong> — diamonds you do not physically own — as a virtual inventory.</p>
              <p>Customers browse, select a diamond, and enquire. You source it from the RapNet supplier and fulfil the order.</p>
              <p className="text-amber-600 font-medium">⚠️ Per RapNet terms: diamonds must NEVER be downloaded or saved to your database. They are always queried live.</p>
            </div>
            <a href="https://raptech.rapaport.com/instant-inventory/" target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 mt-3">
              <ExternalLink size={12}/> RapNet Instant Inventory documentation
            </a>
          </div>

          {/* Setup instructions */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3">Setup instructions</h3>
            <ol className="text-xs text-ink-500 space-y-2 leading-relaxed list-decimal list-inside">
              <li>Log in to your RapNet account at <a href="https://www.rapnet.com" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">rapnet.com</a></li>
              <li>Go to Settings → API → Generate Bearer Token</li>
              <li>Ensure your subscription includes the "Instant Inventory" add-on</li>
              <li>Set up your Instant Inventory feed — select suppliers and markup rules in RapNet</li>
              <li>Add <code className="bg-ink-100 dark:bg-ink-800 px-1 py-0.5 rounded font-mono">RAPNET_TOKEN=your_token</code> to your <code className="bg-ink-100 dark:bg-ink-800 px-1 py-0.5 rounded font-mono">.env</code> file</li>
              <li>Restart the backend container</li>
              <li>Set your markup percentage below and test the connection</li>
            </ol>
          </div>

          {/* Config */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className={lbl}>RapNet Bearer token</label>
                <input type="password" value={form.RAPNET_TOKEN} onChange={e=>setForm(f=>({...f,RAPNET_TOKEN:e.target.value}))}
                  className={inp} placeholder="eyJhbGciOiJSUzI1NiIs..."/>
                <p className="text-[10px] text-ink-400 mt-1">Paste your Bearer token from RapNet API settings. This is saved to the settings table — add to .env for immediate effect.</p>
              </div>
              <div>
                <label className={lbl}>Your markup % on RapNet prices</label>
                <input type="number" step="0.5" min="0" max="50" value={form.RAPNET_MARKUP_PCT}
                  onChange={e=>setForm(f=>({...f,RAPNET_MARKUP_PCT:e.target.value}))}
                  className={inp} placeholder="5"/>
                <p className="text-[10px] text-ink-400 mt-1">e.g. 5 = your price is 5% above RapNet price. Customer sees this price.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={testConnection} disabled={testing}
                className="btn-outline flex items-center gap-1.5 text-xs">
                <RefreshCw size={13} className={testing?'animate-spin':''}/>{testing?'Testing…':'Test connection'}
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
                <Save size={13}/>{saving?'Saving…':'Save settings'}
              </button>
            </div>
          </div>

          {/* API endpoints */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-3">Available API endpoints</h3>
            <div className="space-y-2 font-mono text-[11px]">
              {[
                ['GET',  '/api/rapnet/status',            'Check if connected'],
                ['GET',  '/api/rapnet/diamonds',          'Search RapNet diamonds (live)'],
                ['GET',  '/api/rapnet/diamonds/:id',      'Single diamond detail'],
                ['GET',  '/api/rapnet/diamonds/:id/certificate', 'Cert download URL'],
                ['GET',  '/api/rapnet/price-list',        'Rapaport price list'],
              ].map(([m,r,d])=>(
                <div key={r} className="flex items-center gap-3 py-1.5 border-b border-ink-100 dark:border-ink-800 last:border-0">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m==='GET'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}`}>{m}</span>
                  <span className="text-ink-600 dark:text-ink-300 flex-1">{r}</span>
                  <span className="text-ink-400 hidden sm:block">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
