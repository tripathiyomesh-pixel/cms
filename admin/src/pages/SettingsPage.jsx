import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Save, Lock, Globe, Bell, Palette, Building, MessageCircle, Mail, TestTube } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { id:'store',    label:'Store',        icon:Building },
  { id:'contact',  label:'Contact',      icon:MessageCircle },
  { id:'branding', label:'Branding',     icon:Palette },
  { id:'email',    label:'Email / SMTP', icon:Mail },
  { id:'password', label:'Password',     icon:Lock },
];

const CURRENCIES = ['AED','USD','SAR','KWD','QAR','OMR','BHD','INR','GBP','EUR'];
const COUNTRIES  = ['UAE','Saudi Arabia','Qatar','Kuwait','Bahrain','Oman','India','UK'];
const TIMEZONES  = ['Asia/Dubai','Asia/Riyadh','Asia/Kuwait','Asia/Kolkata','Europe/London','America/New_York'];

export default function SettingsPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const { user } = useAuth();
  const [tab,     setTab]     = useState('store');
  const [saving,  setSaving]  = useState(false);
  const [testing, setTesting] = useState(false);

  const [store, setStore] = useState({
    store_name:'', tagline:'', country:'UAE', currency:'AED', timezone:'Asia/Dubai',
    vat_number:'', vat_rate:'5', business_registration:'',
  });

  const [contact, setContact] = useState({
    whatsapp_number:'', whatsapp_number_sa:'', whatsapp_number_in:'',
    phone:'', email:'', address:'', website:'',
    instagram:'', facebook:'', youtube:'', linkedin:'',
  });

  const [branding, setBranding] = useState({
    primary_color:'#c9a84c', secondary_color:'#1a1a1a',
    font_family:'Inter', logo_url:'', favicon_url:'',
  });

  const [smtp, setSmtp] = useState({
    smtp_host:'', smtp_port:'587', smtp_secure:'false',
    smtp_user:'', smtp_pass:'',
  });

  const [pw, setPw] = useState({ current_password:'', new_password:'', confirm:'' });

  // Load settings from API
  useEffect(()=>{
    api.get('/settings').then(r=>{
      const map = {};
      (r.data?.data || []).forEach(x => {
        map[x.key] = typeof x.value === 'string' ? x.value.replace(/^"|"$/g, '') : (x.value || '');
      });
      const get = (k, d='') => map[k] ?? d;
      setStore({
        store_name:            get('store_name','My Jewellery Store'),
        tagline:               get('tagline'),
        country:               get('country','UAE'),
        currency:              get('currency','AED'),
        timezone:              get('timezone','Asia/Dubai'),
        vat_number:            get('vat_number'),
        vat_rate:              get('vat_rate','5'),
        business_registration: get('business_registration'),
      });
      setContact({
        whatsapp_number:    get('whatsapp_number'),
        whatsapp_number_sa: get('whatsapp_number_sa'),
        whatsapp_number_in: get('whatsapp_number_in'),
        phone:              get('phone'),
        email:              get('email'),
        address:            get('address'),
        website:            get('website'),
        instagram:          get('instagram'),
        facebook:           get('facebook'),
        youtube:            get('youtube'),
        linkedin:           get('linkedin'),
      });
      setBranding({
        primary_color:   get('primary_color','#c9a84c'),
        secondary_color: get('secondary_color','#1a1a1a'),
        font_family:     get('font_family','Inter'),
        logo_url:        get('logo_url'),
        favicon_url:     get('favicon_url'),
      });
      setSmtp({
        smtp_host:    get('smtp_host'),
        smtp_port:    get('smtp_port','587'),
        smtp_secure:  get('smtp_secure','false'),
        smtp_user:    get('smtp_user'),
        smtp_pass:    get('smtp_pass'),
      });
    }).catch(()=>{});
  },[]);

  const saveSettings = async (data) => {
    setSaving(true);
    try {
      const entries = Object.entries(data).map(([key,value])=>({ key, value: String(value) }));
      await api.post('/settings/bulk', { settings: entries });
      toast.success('Settings saved');
    } catch(e){ toast.error(e.response?.data?.message||'Save failed'); }
    setSaving(false);
  };

  const handlePasswordChange = async(e)=>{
    e.preventDefault();
    if(pw.new_password!==pw.confirm) return toast.error("Passwords don't match");
    if(pw.new_password.length<8) return toast.error('Min 8 characters');
    setSaving(true);
    try {
      await api.post('/auth/change-password',{ current_password:pw.current_password, new_password:pw.new_password });
      toast.success('Password changed'); setPw({ current_password:'',new_password:'',confirm:'' });
    } catch(e){ toast.error(e.response?.data?.message||'Failed'); }
    setSaving(false);
  };

  const testEmail = async()=>{
    setTesting(true);
    try {
      await api.post('/settings/bulk',{ settings:[
        {key:'smtp_host',value:smtp.smtp_host},{key:'smtp_port',value:smtp.smtp_port},
        {key:'smtp_user',value:smtp.smtp_user},{key:'smtp_pass',value:smtp.smtp_pass},
      ]});
      const r = await api.post('/notifications/test-email');
      if(r.data?.success) toast.success('SMTP connected successfully!');
      else toast.error(r.data?.message||'SMTP test failed');
    } catch(e){ toast.error(e.response?.data?.message||'Test failed'); }
    setTesting(false);
  };

  const inp = 'input-field';
  const lbl = 'block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';

  const sS = (k,v) => setStore(s=>({...s,[k]:v}));
  const sC = (k,v) => setContact(s=>({...s,[k]:v}));
  const sB = (k,v) => setBranding(s=>({...s,[k]:v}));
  const sM = (k,v) => setSmtp(s=>({...s,[k]:v}));

  return (
    <>
      <Topbar title="Settings" subtitle="Store configuration and preferences"/>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="max-w-3xl flex gap-5">

          {/* Sidebar tabs */}
          <div className="w-44 flex-shrink-0 space-y-1">
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${tab===t.id?'bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-300':'text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-800'}`}>
                <t.icon size={14}/> {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">

            {/* ── STORE ── */}
            {tab==='store' && (
              <div className="card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Store information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={lbl}>Store name</label>
                    <input value={store.store_name} onChange={e=>sS('store_name',e.target.value)} className={inp} placeholder="My Jewellery Store"/>
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Tagline</label>
                    <input value={store.tagline} onChange={e=>sS('tagline',e.target.value)} className={inp} placeholder="Crafted with excellence"/>
                  </div>
                  <div>
                    <label className={lbl}>Country</label>
                    <select value={store.country} onChange={e=>sS('country',e.target.value)} className={inp}>
                      {COUNTRIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Default currency</label>
                    <select value={store.currency} onChange={e=>sS('currency',e.target.value)} className={inp}>
                      {CURRENCIES.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Timezone</label>
                    <select value={store.timezone} onChange={e=>sS('timezone',e.target.value)} className={inp}>
                      {TIMEZONES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>VAT rate (%)</label>
                    <input type="number" value={store.vat_rate} onChange={e=>sS('vat_rate',e.target.value)} className={inp} placeholder="5"/>
                  </div>
                  <div>
                    <label className={lbl}>VAT / TRN number</label>
                    <input value={store.vat_number} onChange={e=>sS('vat_number',e.target.value)} className={inp} placeholder="1234567890123456"/>
                  </div>
                  <div>
                    <label className={lbl}>Business registration no.</label>
                    <input value={store.business_registration} onChange={e=>sS('business_registration',e.target.value)} className={inp} placeholder="DED-000000"/>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={()=>saveSettings(store)} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
                    <Save size={13}/>{saving?'Saving…':'Save store settings'}
                  </button>
                </div>
              </div>
            )}

            {/* ── CONTACT ── */}
            {tab==='contact' && (
              <div className="card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Contact details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={lbl}>Primary WhatsApp number</label>
                    <input value={contact.whatsapp_number} onChange={e=>sC('whatsapp_number',e.target.value)} className={inp} placeholder="+971 50 000 0000"/>
                    <p className="text-[10px] text-ink-400 mt-1">This number is used for all WhatsApp enquiry links</p>
                  </div>
                  <div>
                    <label className={lbl}>WhatsApp — Saudi Arabia</label>
                    <input value={contact.whatsapp_number_sa} onChange={e=>sC('whatsapp_number_sa',e.target.value)} className={inp} placeholder="+966 50 000 0000"/>
                  </div>
                  <div>
                    <label className={lbl}>WhatsApp — India</label>
                    <input value={contact.whatsapp_number_in} onChange={e=>sC('whatsapp_number_in',e.target.value)} className={inp} placeholder="+91 98000 00000"/>
                  </div>
                  <div>
                    <label className={lbl}>Phone</label>
                    <input value={contact.phone} onChange={e=>sC('phone',e.target.value)} className={inp} placeholder="+971 4 000 0000"/>
                  </div>
                  <div>
                    <label className={lbl}>Email</label>
                    <input type="email" value={contact.email} onChange={e=>sC('email',e.target.value)} className={inp} placeholder="info@yourbrand.com"/>
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Address</label>
                    <textarea value={contact.address} onChange={e=>sC('address',e.target.value)} className={inp} rows={2} placeholder="Full store address"/>
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Website</label>
                    <input value={contact.website} onChange={e=>sC('website',e.target.value)} className={inp} placeholder="https://yourbrand.com"/>
                  </div>
                  <div><label className={lbl}>Instagram</label><input value={contact.instagram} onChange={e=>sC('instagram',e.target.value)} className={inp} placeholder="@yourbrand"/></div>
                  <div><label className={lbl}>Facebook</label><input value={contact.facebook} onChange={e=>sC('facebook',e.target.value)} className={inp} placeholder="facebook.com/yourbrand"/></div>
                  <div><label className={lbl}>YouTube</label><input value={contact.youtube} onChange={e=>sC('youtube',e.target.value)} className={inp} placeholder="youtube.com/@yourbrand"/></div>
                  <div><label className={lbl}>LinkedIn</label><input value={contact.linkedin} onChange={e=>sC('linkedin',e.target.value)} className={inp} placeholder="linkedin.com/company/yourbrand"/></div>
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={()=>saveSettings(contact)} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
                    <Save size={13}/>{saving?'Saving…':'Save contact settings'}
                  </button>
                </div>
              </div>
            )}

            {/* ── BRANDING ── */}
            {tab==='branding' && (
              <div className="card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Brand & appearance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Primary colour</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={branding.primary_color} onChange={e=>sB('primary_color',e.target.value)}
                        className="w-10 h-10 rounded-lg border border-ink-200 cursor-pointer p-0.5"/>
                      <input value={branding.primary_color} onChange={e=>sB('primary_color',e.target.value)} className={`${inp} font-mono`} placeholder="#c9a84c"/>
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Secondary colour</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={branding.secondary_color} onChange={e=>sB('secondary_color',e.target.value)}
                        className="w-10 h-10 rounded-lg border border-ink-200 cursor-pointer p-0.5"/>
                      <input value={branding.secondary_color} onChange={e=>sB('secondary_color',e.target.value)} className={`${inp} font-mono`} placeholder="#1a1a1a"/>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Colour preview</label>
                    <div className="flex gap-3 items-center p-4 bg-ink-50 dark:bg-ink-800 rounded-lg">
                      <div style={{background:branding.primary_color}} className="w-16 h-16 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-bold">Primary</div>
                      <div style={{background:branding.secondary_color}} className="w-16 h-16 rounded-lg shadow-sm flex items-center justify-center text-white text-xs font-bold">Secondary</div>
                      <div className="flex-1">
                        <p className="text-xs text-ink-500">These colours are used on the storefront — buttons, links, highlights.</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Logo URL</label>
                    <input value={branding.logo_url} onChange={e=>sB('logo_url',e.target.value)} className={inp} placeholder="https://... (upload to media library first)"/>
                    {branding.logo_url && <img src={branding.logo_url} alt="Logo preview" className="mt-2 h-12 object-contain rounded border border-ink-200"/>}
                  </div>
                  <div className="col-span-2">
                    <label className={lbl}>Favicon URL</label>
                    <input value={branding.favicon_url} onChange={e=>sB('favicon_url',e.target.value)} className={inp} placeholder="https://... (32×32 PNG)"/>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={()=>saveSettings(branding)} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
                    <Save size={13}/>{saving?'Saving…':'Save branding'}
                  </button>
                </div>
              </div>
            )}

            {/* ── EMAIL / SMTP ── */}
            {tab==='email' && (
              <div className="card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Email configuration (SMTP)</h3>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-blue-700 dark:text-blue-300">
                  For Gmail: use App Password (not your main password). Enable 2FA in Google account → Security → App passwords → Generate one for "Mail".
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className={lbl}>SMTP host</label>
                    <input value={smtp.smtp_host} onChange={e=>sM('smtp_host',e.target.value)} className={inp} placeholder="smtp.gmail.com"/>
                  </div>
                  <div>
                    <label className={lbl}>Port</label>
                    <select value={smtp.smtp_port} onChange={e=>sM('smtp_port',e.target.value)} className={inp}>
                      <option value="587">587 (TLS — recommended)</option>
                      <option value="465">465 (SSL)</option>
                      <option value="25">25</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Security</label>
                    <select value={smtp.smtp_secure} onChange={e=>sM('smtp_secure',e.target.value)} className={inp}>
                      <option value="false">TLS / STARTTLS</option>
                      <option value="true">SSL</option>
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Email address</label>
                    <input type="email" value={smtp.smtp_user} onChange={e=>sM('smtp_user',e.target.value)} className={inp} placeholder="yourstore@gmail.com"/>
                  </div>
                  <div>
                    <label className={lbl}>App password</label>
                    <input type="password" value={smtp.smtp_pass} onChange={e=>sM('smtp_pass',e.target.value)} className={inp} placeholder="Google App Password"/>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button onClick={testEmail} disabled={testing} className="btn-outline flex items-center gap-1.5 text-xs">
                    <TestTube size={13}/>{testing?'Testing…':'Test connection'}
                  </button>
                  <button onClick={()=>saveSettings(smtp)} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
                    <Save size={13}/>{saving?'Saving…':'Save SMTP settings'}
                  </button>
                </div>
              </div>
            )}

            {/* ── PASSWORD ── */}
            {tab==='password' && (
              <div className="card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200">Change password</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gold-500 flex items-center justify-center text-white font-bold">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-700 dark:text-ink-200">{user?.name}</p>
                    <p className="text-xs text-ink-400">{user?.email} · {user?.role?.replace('_',' ')}</p>
                  </div>
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {[
                    {k:'current_password',l:'Current password'},
                    {k:'new_password',l:'New password'},
                    {k:'confirm',l:'Confirm new password'},
                  ].map(f=>(
                    <div key={f.k}>
                      <label className={lbl}>{f.l}</label>
                      <input type="password" value={pw[f.k]} onChange={e=>setPw(p=>({...p,[f.k]:e.target.value}))}
                        required className={inp} placeholder="••••••••"/>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
                      <Save size={13}/>{saving?'Saving…':'Change password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
