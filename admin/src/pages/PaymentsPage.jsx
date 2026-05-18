import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import Toggle from '../components/ui/Toggle';
import api from '../services/api';
import { Save, RefreshCw, ExternalLink, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const GATEWAYS = [
  {
    id: 'tap',
    name: 'Tap Payments',
    logo: '🔵',
    tagline: 'Primary gateway for UAE, Kuwait, Bahrain, Qatar, Oman',
    regions: ['UAE','KSA','Kuwait','Bahrain','Qatar','Oman'],
    currencies: ['AED','SAR','KWD','BHD','OMR','QAR'],
    type: 'Card + Apple Pay + Google Pay',
    docs: 'https://developers.tap.company',
    fields: [
      { key:'tap_public_key',  label:'Public key',  type:'text',     ph:'pk_test_...' },
      { key:'tap_secret_key',  label:'Secret key',  type:'password', ph:'sk_test_...' },
      { key:'tap_test_mode',   label:'Test mode',   type:'toggle' },
    ],
  },
  {
    id: 'geidea',
    name: 'Geidea',
    logo: '🟠',
    tagline: 'Card payments for UAE, KSA, Egypt with HPP',
    regions: ['UAE','KSA','Egypt'],
    currencies: ['AED','SAR','EGP'],
    type: 'Card + BNPL + Apple/Google Pay',
    docs: 'https://docs.geidea.net',
    fields: [
      { key:'geidea_merchant_key', label:'Merchant public key', type:'text',     ph:'Your merchant key' },
      { key:'geidea_password',     label:'Password',            type:'password', ph:'API password' },
      { key:'geidea_test_mode',    label:'Test mode',           type:'toggle' },
    ],
  },
  {
    id: 'tabby',
    name: 'Tabby',
    logo: '🟢',
    tagline: 'Buy now, pay later in 4 installments — UAE & KSA',
    regions: ['UAE','KSA'],
    currencies: ['AED','SAR'],
    type: 'Buy Now Pay Later (4 installments, 0% interest)',
    docs: 'https://docs.tabby.ai',
    note: 'Ideal for high-value jewellery — customer pays AED 15,000 as 4×AED 3,750',
    fields: [
      { key:'tabby_public_key',  label:'Public key',  type:'text',     ph:'pk_test_...' },
      { key:'tabby_secret_key',  label:'Secret key',  type:'password', ph:'sk_test_...' },
      { key:'tabby_test_mode',   label:'Test mode',   type:'toggle' },
    ],
  },
  {
    id: 'tamara',
    name: 'Tamara',
    logo: '🟣',
    tagline: 'Buy now, pay later in 3 installments — Saudi Arabia & UAE',
    regions: ['KSA','UAE'],
    currencies: ['SAR','AED'],
    type: 'Buy Now Pay Later (3 installments)',
    docs: 'https://docs.tamara.co',
    note: 'Strongest in Saudi Arabia — recommended if you have Saudi customers',
    fields: [
      { key:'tamara_token',     label:'API token',   type:'password', ph:'Bearer token from Tamara portal' },
      { key:'tamara_test_mode', label:'Test mode',   type:'toggle' },
    ],
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    logo: '🔷',
    tagline: 'India\'s #1 gateway — cards, UPI, net banking, wallets, EMI',
    regions: ['India'],
    currencies: ['INR'],
    type: 'Card + UPI + Net Banking + Wallets + EMI + BNPL',
    docs: 'https://razorpay.com/docs/api',
    note: 'Requires Indian-registered business. Supports all Indian payment methods including UPI (GPay, PhonePe, Paytm).',
    fields: [
      { key:'razorpay_key_id',     label:'Key ID',     type:'text',     ph:'rzp_test_...' },
      { key:'razorpay_key_secret', label:'Key secret', type:'password', ph:'Secret key' },
      { key:'razorpay_test_mode',  label:'Test mode',  type:'toggle' },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    logo: '🟤',
    tagline: 'International cards — USD, EUR, GBP and 135+ currencies',
    regions: ['International'],
    currencies: ['USD','EUR','GBP','AED','+ 135 more'],
    type: 'Card (international) + Apple Pay + Google Pay',
    docs: 'https://stripe.com/docs',
    note: 'Best for international customers paying in USD/EUR/GBP. Simple integration.',
    fields: [
      { key:'stripe_public_key',  label:'Publishable key', type:'text',     ph:'pk_test_...' },
      { key:'stripe_secret_key',  label:'Secret key',      type:'password', ph:'sk_test_...' },
      { key:'stripe_test_mode',   label:'Test mode',       type:'toggle' },
    ],
  },
];

const STATUS_COLORS = {
  captured:'text-green-600 bg-green-50',
  failed:'text-red-600 bg-red-50',
  pending:'text-amber-600 bg-amber-50',
  initiated:'text-blue-600 bg-blue-50',
  refunded:'text-purple-600 bg-purple-50',
  cancelled:'text-ink-500 bg-ink-100',
};

export default function PaymentsPage() {
  const { collapsed } = useOutletContext()||{};
  const [tab,       setTab]       = useState('gateways');
  const [settings,  setSettings]  = useState({});
  const [enabled,   setEnabled]   = useState({});
  const [saving,    setSaving]    = useState(false);
  const [transactions, setTxns]   = useState([]);
  const [txTotal,   setTxTotal]   = useState(0);
  const [txRevenue, setTxRevenue] = useState(0);
  const [filter,    setFilter]    = useState({ gateway:'', status:'' });
  const [loadingTx, setLoadingTx] = useState(false);

  useEffect(()=>{
    loadSettings();
    if(tab==='transactions') loadTransactions();
  },[tab]);

  const loadSettings = async()=>{
    try {
      const r = await api.get('/settings');
      const map = {};
      (r.data.data||[]).forEach(s=>{ map[s.key]=typeof s.value==='string'?s.value.replace(/^"|"$/g,''):String(s.value||'').replace(/^"|"$/g,''); });
      setSettings(map);
      // Build enabled map
      const en={};
      GATEWAYS.forEach(g=>{ en[g.id] = map[`${g.id}_enabled`]==='true'; });
      setEnabled(en);
    } catch {}
  };

  const loadTransactions = async()=>{
    setLoadingTx(true);
    try {
      const params = new URLSearchParams({ limit:30, ...Object.fromEntries(Object.entries(filter).filter(([,v])=>v)) });
      const r = await api.get(`/payments?${params}`);
      setTxns(r.data.data||[]);
      setTxTotal(r.data.total||0);
      setTxRevenue(r.data.revenue||0);
    } catch {}
    setLoadingTx(false);
  };

  const set = (k,v)=>setSettings(s=>({...s,[k]:v}));
  const toggleGateway = (id)=>setEnabled(e=>({...e,[id]:!e[id]}));

  const handleSave = async()=>{
    setSaving(true);
    try {
      const all = { ...settings };
      GATEWAYS.forEach(g=>{ all[`${g.id}_enabled`] = enabled[g.id]?'true':'false'; });
      await api.post('/settings/bulk',{ settings:Object.entries(all).map(([key,value])=>({ key,value:String(value) })) });
      toast.success('Payment settings saved');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const lbl='block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1 uppercase tracking-wide';
  const inp='input-field text-xs';

  return (
    <>
      <Topbar title="Payments" subtitle="Configure payment gateways and view transactions"
        actions={
          tab==='gateways' ? (
            <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
              <Save size={13}/>{saving?'Saving…':'Save settings'}
            </button>
          ) : (
            <button onClick={loadTransactions} className="btn-outline flex items-center gap-1.5 text-xs">
              <RefreshCw size={13}/>Refresh
            </button>
          )
        }/>

      <div className="flex-1 overflow-y-auto p-5">
        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-ink-50 dark:bg-ink-800/50 p-1 rounded-xl w-fit">
          {['gateways','transactions'].map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${tab===t?'bg-white dark:bg-ink-800 text-gold-600 shadow-sm':'text-ink-400 hover:text-ink-600'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* GATEWAYS TAB */}
        {tab==='gateways' && (
          <div className="space-y-4 max-w-3xl">
            {GATEWAYS.map(gw=>(
              <div key={gw.id} className={`card overflow-hidden transition-all ${enabled[gw.id]?'border-gold-200 dark:border-gold-800/40':'border-ink-200 dark:border-ink-700'}`}>
                {/* Gateway header */}
                <div className="flex items-start gap-4 p-5">
                  <div className="text-3xl flex-shrink-0">{gw.logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">{gw.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${enabled[gw.id]?'bg-green-100 text-green-700':'bg-ink-100 text-ink-500'}`}>
                        {enabled[gw.id]?'Enabled':'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-ink-400 mb-2">{gw.tagline}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{gw.type}</span>
                      {gw.regions.map(r=><span key={r} className="text-[10px] bg-ink-100 text-ink-500 px-2 py-0.5 rounded-full dark:bg-ink-700 dark:text-ink-300">{r}</span>)}
                      {gw.currencies.map(c=><span key={c} className="text-[10px] bg-gold-50 text-gold-600 px-2 py-0.5 rounded-full">{c}</span>)}
                    </div>
                    {gw.note && <p className="text-[11px] text-amber-600 mt-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg px-3 py-1.5">{gw.note}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <a href={gw.docs} target="_blank" rel="noreferrer" className="text-xs text-gold-600 hover:text-gold-700 flex items-center gap-1"><ExternalLink size={11}/>Docs</a>
                    <Toggle checked={!!enabled[gw.id]} onChange={()=>toggleGateway(gw.id)}/>
                  </div>
                </div>

                {/* Credentials (only when enabled) */}
                {enabled[gw.id] && (
                  <div className="border-t border-ink-100 dark:border-ink-800 px-5 py-4 bg-ink-50/50 dark:bg-ink-800/30">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {gw.fields.filter(f=>f.type!=='toggle').map(f=>(
                        <div key={f.key}>
                          <label className={lbl}>{f.label}</label>
                          <input type={f.type} value={settings[f.key]||''} onChange={e=>set(f.key,e.target.value)}
                            className={inp} placeholder={f.ph} autoComplete="off"/>
                        </div>
                      ))}
                      {gw.fields.filter(f=>f.type==='toggle').map(f=>(
                        <div key={f.key} className="flex items-center justify-between p-3 bg-white dark:bg-ink-800 rounded-xl sm:col-span-2">
                          <div>
                            <p className="text-xs font-medium text-ink-700 dark:text-ink-200">{f.label}</p>
                            <p className="text-[11px] text-ink-400">Use test credentials until you go live</p>
                          </div>
                          <Toggle checked={settings[f.key]==='true'||settings[f.key]===true} onChange={v=>set(f.key,v?'true':'false')}/>
                        </div>
                      ))}
                    </div>
                    {/* Webhook URL */}
                    <div className="mt-3 bg-white dark:bg-ink-900 rounded-xl p-3">
                      <p className="text-[10px] text-ink-400 mb-1">Webhook URL — paste this in {gw.name} dashboard</p>
                      <code className="text-[11px] text-green-600 font-mono">
                        {window.location.origin.replace('3010','4000')}/api/payments/webhook/{gw.id}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TRANSACTIONS TAB */}
        {tab==='transactions' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { l:'Total transactions', v:txTotal, c:'text-ink-700 dark:text-ink-200' },
                { l:'Revenue captured',   v:`AED ${Number(txRevenue).toLocaleString()}`, c:'text-green-600' },
                { l:'Active gateways',    v:Object.values(enabled).filter(Boolean).length, c:'text-gold-600' },
              ].map(s=>(
                <div key={s.l} className="card p-4">
                  <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
                  <div className="text-xs text-ink-400 mt-1">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 mb-4 flex-wrap">
              <select value={filter.gateway} onChange={e=>{setFilter(f=>({...f,gateway:e.target.value}));}} className="text-xs border border-ink-200 rounded-lg px-3 py-1.5 outline-none focus:border-gold-400 bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300">
                <option value="">All gateways</option>
                {GATEWAYS.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
              <select value={filter.status} onChange={e=>setFilter(f=>({...f,status:e.target.value}))} className="text-xs border border-ink-200 rounded-lg px-3 py-1.5 outline-none focus:border-gold-400 bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-300">
                <option value="">All statuses</option>
                {['pending','initiated','captured','failed','refunded','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={loadTransactions} className="btn-outline text-xs">Apply filters</button>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
              {loadingTx ? (
                <div className="py-12 text-center text-xs text-ink-400">Loading transactions…</div>
              ) : txns.length===0 ? (
                <div className="py-16 text-center">
                  <DollarSign size={32} className="mx-auto text-ink-200 mb-3"/>
                  <p className="text-sm text-ink-400">No transactions yet</p>
                </div>
              ) : txns.map((tx,i)=>(
                <div key={tx.id} className={`flex items-center gap-4 px-5 py-3 text-xs ${i%2===0?'':'bg-ink-50/50 dark:bg-ink-800/30'} ${i<txns.length-1?'border-b border-ink-100 dark:border-ink-800':''}`}>
                  <div className="w-20 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[tx.status]||'bg-ink-100 text-ink-500'}`}>{tx.status}</span>
                  </div>
                  <div className="w-24 flex-shrink-0">
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-mono capitalize">{tx.gateway}</span>
                  </div>
                  <div className="flex-1 font-mono text-ink-600 dark:text-ink-300">{tx.order_number}</div>
                  <div className="text-ink-400 flex-shrink-0">{tx.customer_name||tx.customer_email||'—'}</div>
                  <div className="font-semibold text-ink-700 dark:text-ink-200 flex-shrink-0">{tx.currency} {Number(tx.amount).toLocaleString()}</div>
                  <div className="text-ink-400 flex-shrink-0">{tx.created_at?new Date(tx.created_at).toLocaleDateString('en-AE'):''}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
