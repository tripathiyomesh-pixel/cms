import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import Toggle from '../components/ui/Toggle';
import api from '../services/api';
import { Save, Settings, Cookie, Bell, Wrench, Code, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { id:'preloader',    label:'Preloader',    icon:Loader },
  { id:'cookie',       label:'Cookie',       icon:Cookie },
  { id:'popup',        label:'Popup',        icon:Bell },
  { id:'maintenance',  label:'Maintenance',  icon:Wrench },
  { id:'analytics',    label:'Analytics',    icon:Settings },
  { id:'custom_code',  label:'Custom code',  icon:Code },
];

const PRELOADER_STYLES = [
  { id:'diamond', label:'Diamond', preview:'◈' },
  { id:'spinner', label:'Spinner', preview:'◌' },
  { id:'dots',    label:'Dots',    preview:'···' },
  { id:'bars',    label:'Bars',    preview:'|||' },
  { id:'pulse',   label:'Pulse',   preview:'●' },
  { id:'ripple',  label:'Ripple',  preview:'◎' },
];

const POPUP_TYPES = [
  { id:'newsletter',   label:'Newsletter',    desc:'Email subscribe form' },
  { id:'promotion',    label:'Promotion',     desc:'CTA button + image' },
  { id:'announcement', label:'Announcement',  desc:'Simple message + link' },
  { id:'vip',          label:'VIP access',    desc:'Exclusive collection' },
  { id:'image_only',   label:'Image only',    desc:'Full image popup' },
];

export default function FrontendSettingsPage() {
  const { collapsed } = useOutletContext()||{};
  const [tab,     setTab]     = useState('preloader');
  const [s,       setS]       = useState({});
  const [saving,  setSaving]  = useState(false);

  useEffect(()=>{
    api.get('/settings').then(r=>{
      const map={};
      (r.data.data||[]).forEach(x=>{ map[x.key]=typeof x.value==='string'?x.value.replace(/^"|"$/g,''):String(x.value||''); });
      setS(map);
    }).catch(()=>{});
  },[]);

  const set = (k,v) => setS(prev=>({...prev,[k]:v}));

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/settings/bulk',{ settings:Object.entries(s).map(([key,value])=>({key,value:String(value)})) });
      toast.success('Frontend settings saved');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const lbl = 'block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';
  const inp = 'input-field';
  const ta  = 'input-field font-mono text-xs';
  const row = (label, desc, key) => (
    <div key={key} className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
      <div><p className="text-sm font-medium text-ink-700 dark:text-ink-200">{label}</p><p className="text-xs text-ink-400">{desc}</p></div>
      <Toggle checked={s[key]==='true'} onChange={v=>set(key,v?'true':'false')}/>
    </div>
  );

  return (
    <>
      <Topbar title="Frontend settings" subtitle="Preloader, cookie consent, popups, maintenance, analytics"
        actions={<button onClick={save} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs"><Save size={13}/>{saving?'Saving…':'Save settings'}</button>}/>

      <div className="flex flex-1 overflow-hidden">
        {/* Tab nav */}
        <div className="w-44 border-r border-ink-200/60 dark:border-ink-800 bg-ink-50 dark:bg-ink-900/50 py-3 flex-shrink-0">
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium text-left transition-all ${tab===t.id?'bg-white dark:bg-ink-800 text-gold-600 border-r-2 border-gold-500':'text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'}`}>
              <t.icon size={14}/>{t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl space-y-4">

            {tab==='preloader' && <>
              {row('Enable preloader','Show loading animation when storefront loads','preloader_enabled')}
              {s.preloader_enabled==='true' && <>
                <div>
                  <label className={lbl}>Style</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRELOADER_STYLES.map(ps=>(
                      <button key={ps.id} onClick={()=>set('preloader_style',ps.id)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${s.preloader_style===ps.id?'border-gold-500 bg-gold-50':'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                        <div className="text-2xl mb-1">{ps.preview}</div>
                        <div className="text-xs text-ink-500">{ps.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div><label className={lbl}>Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={s.preloader_color||'#c9a84c'} onChange={e=>set('preloader_color',e.target.value)} className="w-10 h-10 rounded-xl border border-ink-200 cursor-pointer"/>
                    <span className="text-sm text-ink-600 dark:text-ink-300 font-mono">{s.preloader_color||'#c9a84c'}</span>
                  </div>
                </div>
              </>}
            </>}

            {tab==='cookie' && <>
              {row('Enable cookie consent','GDPR compliant cookie notice at bottom of page','cookie_enabled')}
              {s.cookie_enabled==='true' && <>
                <div><label className={lbl}>Message</label><textarea value={s.cookie_message||''} onChange={e=>set('cookie_message',e.target.value)} className={inp} rows={2} placeholder="We use cookies to enhance your experience."/></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={lbl}>Accept button text</label><input value={s.cookie_accept_label||''} onChange={e=>set('cookie_accept_label',e.target.value)} className={inp} placeholder="Accept"/></div>
                  <div><label className={lbl}>Decline button text</label><input value={s.cookie_decline_label||''} onChange={e=>set('cookie_decline_label',e.target.value)} className={inp} placeholder="Decline"/></div>
                </div>
                <div><label className={lbl}>Privacy policy link</label><input value={s.cookie_more_link||''} onChange={e=>set('cookie_more_link',e.target.value)} className={inp} placeholder="/privacy-policy"/></div>
                <div><label className={lbl}>Cookie expiry (days)</label><input type="number" value={s.cookie_expire_days||'30'} onChange={e=>set('cookie_expire_days',e.target.value)} className={inp} placeholder="30"/></div>
              </>}
            </>}

            {tab==='popup' && <>
              {row('Enable popup','Show popup to visitors after page loads','popup_enabled')}
              {s.popup_enabled==='true' && <>
                <div><label className={lbl}>Popup type</label>
                  <div className="space-y-2">
                    {POPUP_TYPES.map(pt=>(
                      <label key={pt.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${s.popup_type===pt.id?'border-gold-500 bg-gold-50 dark:bg-gold-900/20':'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                        <input type="radio" checked={s.popup_type===pt.id} onChange={()=>set('popup_type',pt.id)} className="accent-gold-500"/>
                        <div><p className="text-sm font-medium text-ink-700 dark:text-ink-200">{pt.label}</p><p className="text-xs text-ink-400">{pt.desc}</p></div>
                      </label>
                    ))}
                  </div>
                </div>
                <div><label className={lbl}>Title</label><input value={s.popup_title||''} onChange={e=>set('popup_title',e.target.value)} className={inp} placeholder="Exclusive Offers"/></div>
                <div><label className={lbl}>Message</label><textarea value={s.popup_message||''} onChange={e=>set('popup_message',e.target.value)} className={inp} rows={2}/></div>
                {s.popup_type!=='newsletter' && <>
                  <div><label className={lbl}>CTA button text</label><input value={s.popup_cta_text||''} onChange={e=>set('popup_cta_text',e.target.value)} className={inp} placeholder="View Collection"/></div>
                  <div><label className={lbl}>CTA link</label><input value={s.popup_cta_url||''} onChange={e=>set('popup_cta_url',e.target.value)} className={inp} placeholder="/jewellery"/></div>
                </>}
                <div><label className={lbl}>Background image URL</label><input value={s.popup_image||''} onChange={e=>set('popup_image',e.target.value)} className={inp} placeholder="https://..."/></div>
                <div><label className={lbl}>Show delay</label>
                  <select value={s.popup_delay||'3000'} onChange={e=>set('popup_delay',e.target.value)} className={inp}>
                    {[['1000','1 second'],['2000','2 seconds'],['3000','3 seconds (recommended)'],['5000','5 seconds'],['8000','8 seconds'],['0','Immediately']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </>}
            </>}

            {tab==='maintenance' && <>
              {row('Maintenance mode','Storefront shows maintenance page. Admin can still access.','maintenance_enabled')}
              <div><label className={lbl}>Maintenance message</label><textarea value={s.maintenance_message||''} onChange={e=>set('maintenance_message',e.target.value)} className={inp} rows={3} placeholder="We are updating our collection. Back soon."/></div>
              {s.maintenance_enabled==='true' && <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl"><p className="text-xs text-amber-700 font-semibold">⚠️ Maintenance mode is ON — storefront is currently showing the maintenance page to visitors.</p></div>}
            </>}

            {tab==='analytics' && <>
              <div><label className={lbl}>Google Analytics ID</label><input value={s.google_analytics_id||''} onChange={e=>set('google_analytics_id',e.target.value)} className={inp} placeholder="G-XXXXXXXXXX or UA-XXXXXXXX-X"/><p className="text-xs text-ink-400 mt-1">Injected automatically in storefront. Leave blank to disable.</p></div>
              <div className="p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                <p className="text-xs text-ink-400 leading-relaxed">Get your ID from <strong>analytics.google.com</strong> → Admin → Data Streams → your stream → Measurement ID</p>
              </div>
            </>}

            {tab==='custom_code' && <>
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-xl mb-4">
                <p className="text-xs text-amber-700">Use with caution — bad code can break the storefront. Paste raw HTML/script tags.</p>
              </div>
              <div><label className={lbl}>Custom &lt;head&gt; code</label><textarea value={s.custom_head_code||''} onChange={e=>set('custom_head_code',e.target.value)} className={ta} rows={6} placeholder="<!-- Paste scripts, meta tags, or CSS here -->" style={{fontFamily:'monospace'}}/><p className="text-xs text-ink-400 mt-1">Injected into &lt;head&gt; on all storefront pages</p></div>
              <div><label className={lbl}>Custom &lt;body&gt; code</label><textarea value={s.custom_body_code||''} onChange={e=>set('custom_body_code',e.target.value)} className={ta} rows={6} placeholder="<!-- Paste scripts or HTML here -->" style={{fontFamily:'monospace'}}/><p className="text-xs text-ink-400 mt-1">Injected before &lt;/body&gt; on all storefront pages</p></div>
            </>}

          </div>
        </div>
      </div>
    </>
  );
}
