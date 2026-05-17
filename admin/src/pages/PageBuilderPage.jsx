import Toggle from '../components/ui/Toggle';
import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import api from '../services/api';
import { Save, Eye, Layout, Type, Palette, Grid, Filter, Square } from 'lucide-react';
import toast from 'react-hot-toast';

const SECTIONS = [
  { id:'template',  label:'Template',      icon:Layout   },
  { id:'header',    label:'Header',        icon:Square   },
  { id:'hero',      label:'Hero section',  icon:Eye      },
  { id:'grid',      label:'Product grid',  icon:Grid     },
  { id:'filters',   label:'Filters',       icon:Filter   },
  { id:'footer',    label:'Footer',        icon:Square   },
  { id:'colors',    label:'Colors & fonts',icon:Palette  },
];

export default function PageBuilderPage() {
  const { collapsed, toggleSidebar } = useOutletContext();
  const [active, setActive] = useState('template');
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(()=>{
    api.get('/settings/page-builder').then(r=>setSettings(r.data.data||{})).catch(()=>{});
  },[]);

  const set = (k,v) => setSettings(s=>({...s,[k]:v}));

  const handleSave = async() => {
    setSaving(true);
    try {
      await api.post('/settings/bulk',{ settings: Object.entries(settings).map(([key,value])=>({ key, value:String(value) })) });
      toast.success('Page builder settings saved');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const lbl = 'block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';
  const inp = 'input-field';
  const sel = 'input-field';
  const tog = (k) => (
    <Toggle checked={settings[k]==='true'} onChange={v=>set(k,v?'true':'false')}/>
  );

  return (
    <>
      <Topbar title="Page builder" subtitle="Customise every section of your storefront"
        actions={
          <button onClick={handleSave} disabled={saving} className="btn-gold flex items-center gap-1.5 text-xs">
            <Save size={13}/>{saving?'Saving…':'Save all changes'}
          </button>
        }/>

      <div className="flex flex-1 overflow-hidden">
        {/* Section nav */}
        <div className="w-44 border-r border-ink-200/60 dark:border-ink-800 bg-ink-50 dark:bg-ink-900/50 flex-shrink-0 py-3">
          {SECTIONS.map(s=>(
            <button key={s.id} onClick={()=>setActive(s.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium text-left transition-all ${active===s.id?'bg-white dark:bg-ink-800 text-gold-600 border-r-2 border-gold-500':'text-ink-500 hover:text-ink-700 dark:hover:text-ink-300'}`}>
              <s.icon size={14}/>
              {s.label}
            </button>
          ))}
        </div>

        {/* Settings panel */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-xl space-y-5">

            {active==='template' && <>
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Storefront template</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id:'luxury-dark',    name:'Luxury Dark',    desc:'Cartier/Graff — dark, gold', preview:'🖤' },
                  { id:'clean-minimal',  name:'Clean Minimal',  desc:'Blue Nile — white, modern', preview:'⬜' },
                  { id:'boutique-warm',  name:'Boutique Warm',  desc:'GCC boutique — warm cream', preview:'🤎' },
                  { id:'diamond-dealer', name:'Diamond Dealer', desc:'Search-first — navy', preview:'💙' },
                ].map(t=>(
                  <button key={t.id} onClick={()=>set('storefront_template',t.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${settings.storefront_template===t.id?'border-gold-500 bg-gold-50 dark:bg-gold-900/20':'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                    <div className="text-2xl mb-2">{t.preview}</div>
                    <div className={`text-xs font-semibold ${settings.storefront_template===t.id?'text-gold-700':'text-ink-700 dark:text-ink-200'}`}>{t.name}</div>
                    <div className="text-[11px] text-ink-400 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </>}

            {active==='header' && <>
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Header settings</h3>
              <div><label className={lbl}>Logo URL (image)</label><input value={settings.header_logo_url||''} onChange={e=>set('header_logo_url',e.target.value)} className={inp} placeholder="https://... (leave blank to use text logo)"/></div>
              <div><label className={lbl}>Logo text</label><input value={settings.header_logo_text||''} onChange={e=>set('header_logo_text',e.target.value)} className={inp} placeholder="Your store name"/></div>
              <div className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                <div><p className="text-sm font-medium text-ink-700 dark:text-ink-200">Top announcement bar</p><p className="text-xs text-ink-400">Strip above header with text</p></div>
                {tog('header_show_topbar')}
              </div>
              {settings.header_show_topbar==='true' && <>
                <div><label className={lbl}>Top bar text</label><input value={settings.header_topbar_text||''} onChange={e=>set('header_topbar_text',e.target.value)} className={inp} placeholder="Free shipping on orders above AED 500"/></div>
                <div><label className={lbl}>Top bar background</label>
                  <div className="flex gap-2">
                    {['#c9a84c','#1a1a1a','#8b5e3c','#1d4ed8','#25d366'].map(c=>(
                      <button key={c} onClick={()=>set('header_topbar_bg',c)} style={{background:c}} className={`w-8 h-8 rounded-full border-2 transition-all ${settings.header_topbar_bg===c?'border-gold-500 scale-110':'border-transparent'}`}/>
                    ))}
                  </div>
                </div>
              </>}
              <div><label className={lbl}>Navigation style</label>
                <select value={settings.header_nav_style||'transparent-scroll'} onChange={e=>set('header_nav_style',e.target.value)} className={sel}>
                  <option value="transparent-scroll">Transparent → solid on scroll</option>
                  <option value="always-solid">Always solid white/dark</option>
                  <option value="always-transparent">Always transparent</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                <div><p className="text-sm font-medium text-ink-700 dark:text-ink-200">Show WhatsApp button in header</p></div>
                {tog('header_show_whatsapp')}
              </div>
            </>}

            {active==='hero' && <>
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Hero section</h3>
              <div><label className={lbl}>Hero layout</label>
                <select value={settings.hero_layout||'fullscreen'} onChange={e=>set('hero_layout',e.target.value)} className={sel}>
                  <option value="fullscreen">Fullscreen (100vh) — editorial</option>
                  <option value="split-screen">Split screen — text left, image right</option>
                  <option value="centered">Centered — text over image</option>
                  <option value="minimal">Minimal — text only, no image</option>
                  <option value="search-first">Search first — diamond search bar</option>
                </select>
              </div>
              <div><label className={lbl}>Overlay opacity: {settings.hero_overlay_opacity||'60'}%</label>
                <input type="range" min="0" max="90" step="5" value={settings.hero_overlay_opacity||'60'} onChange={e=>set('hero_overlay_opacity',e.target.value)} className="w-full accent-gold-500"/>
              </div>
              <div className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                <div><p className="text-sm font-medium text-ink-700 dark:text-ink-200">Auto-slide</p><p className="text-xs text-ink-400">Automatically cycle hero slides</p></div>
                {tog('hero_autoplay')}
              </div>
              {settings.hero_autoplay==='true' && (
                <div><label className={lbl}>Slide interval (seconds)</label>
                  <select value={settings.hero_autoplay_interval||'5'} onChange={e=>set('hero_autoplay_interval',e.target.value)} className={sel}>
                    {['3','4','5','6','8','10'].map(v=><option key={v} value={v}>{v} seconds</option>)}
                  </select>
                </div>
              )}
              <div className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                <div><p className="text-sm font-medium text-ink-700 dark:text-ink-200">Show stats bar</p><p className="text-xs text-ink-400">10,000+ diamonds · GIA/IGI · Custom creation</p></div>
                {tog('hero_show_stats')}
              </div>
            </>}

            {active==='grid' && <>
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Product grid</h3>
              <div><label className={lbl}>Default columns</label>
                <select value={settings.grid_columns||'4'} onChange={e=>set('grid_columns',e.target.value)} className={sel}>
                  {[['2','2 columns — large cards'],['3','3 columns — balanced'],['4','4 columns — standard'],['5','5 columns — compact']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Card style</label>
                <select value={settings.grid_card_style||'standard'} onChange={e=>set('grid_card_style',e.target.value)} className={sel}>
                  <option value="standard">Standard — image + name + price</option>
                  <option value="minimal">Minimal — image + price only</option>
                  <option value="detailed">Detailed — image + all specs</option>
                  <option value="luxury">Luxury — large, editorial style</option>
                </select>
              </div>
              {[
                { k:'grid_show_price',        l:'Show price',             d:'Display price on product cards' },
                { k:'grid_show_quick_enquire',l:'Show quick enquire',      d:'WhatsApp button on card hover' },
                { k:'grid_show_new_badge',    l:'Show New badge',          d:'Badge on recently added products' },
              ].map(item=>(
                <div key={item.k} className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                  <div><p className="text-sm font-medium text-ink-700 dark:text-ink-200">{item.l}</p><p className="text-xs text-ink-400">{item.d}</p></div>
                  {tog(item.k)}
                </div>
              ))}
              <div><label className={lbl}>Default sort</label>
                <select value={settings.grid_sort_default||'newest'} onChange={e=>set('grid_sort_default',e.target.value)} className={sel}>
                  <option value="newest">Newest first</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                  <option value="featured">Featured first</option>
                </select>
              </div>
            </>}

            {active==='filters' && <>
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Filter settings</h3>
              <div><label className={lbl}>Filter position</label>
                <select value={settings.filter_position||'sidebar'} onChange={e=>set('filter_position',e.target.value)} className={sel}>
                  <option value="sidebar">Left sidebar (desktop)</option>
                  <option value="top-bar">Top bar — horizontal</option>
                  <option value="drawer">Slide-out drawer (mobile style)</option>
                </select>
              </div>
              <div><label className={lbl}>Filter style</label>
                <select value={settings.filter_style||'pills'} onChange={e=>set('filter_style',e.target.value)} className={sel}>
                  <option value="pills">Pills — click to select</option>
                  <option value="checkboxes">Checkboxes — traditional</option>
                  <option value="dropdowns">Dropdowns — compact</option>
                </select>
              </div>
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Visible filters</p>
              {[
                { k:'filter_show_price',   l:'Price range slider' },
                { k:'filter_show_carat',   l:'Carat range (diamonds)' },
                { k:'filter_show_color',   l:'Color grade (diamonds)' },
                { k:'filter_show_clarity', l:'Clarity grade (diamonds)' },
                { k:'filter_show_cert',    l:'Certificate lab (GIA/IGI)' },
              ].map(item=>(
                <div key={item.k} className="flex items-center justify-between py-2 border-b border-ink-100 dark:border-ink-800 last:border-0">
                  <span className="text-sm text-ink-600 dark:text-ink-300">{item.l}</span>
                  {tog(item.k)}
                </div>
              ))}
            </>}

            {active==='footer' && <>
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Footer settings</h3>
              <div><label className={lbl}>Columns</label>
                <select value={settings.footer_columns||'4'} onChange={e=>set('footer_columns',e.target.value)} className={sel}>
                  {[['2','2 columns'],['3','3 columns'],['4','4 columns (standard)']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              {[
                { k:'footer_show_newsletter', l:'Newsletter signup',  d:'Email subscription form in footer' },
                { k:'footer_show_social',     l:'Social media links', d:'Instagram, WhatsApp, Facebook icons' },
              ].map(item=>(
                <div key={item.k} className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                  <div><p className="text-sm font-medium text-ink-700 dark:text-ink-200">{item.l}</p><p className="text-xs text-ink-400">{item.d}</p></div>
                  {tog(item.k)}
                </div>
              ))}
            </>}

            {active==='colors' && <>
              <h3 className="text-sm font-semibold text-ink-700 dark:text-ink-200 mb-4">Colors & fonts</h3>
              <div><label className={lbl}>Accent color</label>
                <div className="flex gap-2 flex-wrap">
                  {[['#c9a84c','Gold'],['#1a1a1a','Black'],['#8b5e3c','Copper'],['#1d4ed8','Blue'],['#6d28d9','Purple'],['#b76e79','Rose']].map(([c,n])=>(
                    <button key={c} onClick={()=>set('color_accent',c)}
                      className={`flex flex-col items-center gap-1 ${settings.color_accent===c?'opacity-100':'opacity-70 hover:opacity-100'}`}>
                      <div style={{background:c}} className={`w-9 h-9 rounded-full border-2 ${settings.color_accent===c?'border-gold-500 scale-110':'border-transparent'} transition-all`}/>
                      <span className="text-[10px] text-ink-400">{n}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div><label className={lbl}>Button style</label>
                <select value={settings.button_style||'rounded'} onChange={e=>set('button_style',e.target.value)} className={sel}>
                  <option value="pill">Pill — fully rounded</option>
                  <option value="rounded">Rounded — slight radius</option>
                  <option value="square">Square — no radius</option>
                </select>
              </div>
              <div><label className={lbl}>Heading font</label>
                <select value={settings.font_heading||'playfair'} onChange={e=>set('font_heading',e.target.value)} className={sel}>
                  <option value="playfair">Playfair Display — luxury serif</option>
                  <option value="cormorant">Cormorant Garamond — editorial</option>
                  <option value="inter">Inter — modern sans-serif</option>
                  <option value="dm-serif">DM Serif — elegant serif</option>
                  <option value="josefin">Josefin Sans — geometric</option>
                </select>
              </div>
              <div><label className={lbl}>Body font</label>
                <select value={settings.font_body||'inter'} onChange={e=>set('font_body',e.target.value)} className={sel}>
                  <option value="inter">Inter — clean, readable</option>
                  <option value="source-sans">Source Sans — neutral</option>
                  <option value="lato">Lato — friendly</option>
                </select>
              </div>
            </>}

          </div>
        </div>
      </div>
    </>
  );
}
