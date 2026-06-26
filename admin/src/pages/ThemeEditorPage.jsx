import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import Toggle from '../components/ui/Toggle';
import { THEMES, THEME_CATEGORIES } from '../data/themes';
import api from '../services/api';
import {
  Save, Eye, Paintbrush, Type, Layout, Monitor,
  Tablet, Smartphone, Check, RotateCcw,
  Sliders, Image, AlignCenter, Grid, Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SECTION_TABS = [
  { id:'themes',   label:'Themes',    icon:Paintbrush },
  { id:'header',   label:'Header',    icon:Layout },
  { id:'footer',   label:'Footer',    icon:Layers },
  { id:'hero',     label:'Hero',      icon:Image },
  { id:'layout',   label:'Layouts',   icon:Grid },
  { id:'colors',   label:'Colors',    icon:Sliders },
  { id:'fonts',    label:'Typography',icon:Type },
  { id:'buttons',  label:'Buttons',   icon:AlignCenter },
];

const PREVIEW_SIZES = [
  { id:'desktop', icon:Monitor,    w:'100%',  label:'Desktop' },
  { id:'tablet',  icon:Tablet,     w:'768px', label:'Tablet' },
  { id:'mobile',  icon:Smartphone, w:'390px', label:'Mobile' },
];

const FONTS = [
  { id:"'Playfair Display', Georgia, serif",    label:'Playfair Display',   style:'serif' },
  { id:"'Cormorant Garamond', Georgia, serif",  label:'Cormorant Garamond', style:'serif' },
  { id:"'DM Serif Display', Georgia, serif",    label:'DM Serif Display',   style:'serif' },
  { id:"'Inter', system-ui, sans-serif",        label:'Inter',              style:'sans'  },
  { id:"'Josefin Sans', system-ui, sans-serif", label:'Josefin Sans',       style:'sans'  },
  { id:"'Lato', system-ui, sans-serif",         label:'Lato',               style:'sans'  },
  { id:"'Montserrat', system-ui, sans-serif",   label:'Montserrat',         style:'sans'  },
];

const ACCENT_COLORS = [
  { label:'Gold',      value:'#c9a84c' },
  { label:'Rose Gold', value:'#b76e79' },
  { label:'Platinum',  value:'#8c8c8c' },
  { label:'Navy',      value:'#1d3557' },
  { label:'Emerald',   value:'#2d6a4f' },
  { label:'Teal',      value:'#0ababa' },
  { label:'Black',     value:'#1a1a1a' },
  { label:'Ruby',      value:'#9b2335' },
];

const MENU_STYLES = [
  { id:'M1',  label:'M1 – Cartier Classic',       desc:'3 cols + right image panel, hover changes image — timeless luxury',       icon:'🏛️' },
  { id:'M2',  label:'M2 – Tiffany Editorial',     desc:'5 full-width columns + bottom image card filmstrip',                      icon:'✦'  },
  { id:'M3',  label:'M3 – Vertical Side Panel',   desc:'Left tall editorial image + 2 columns of links',                          icon:'◧'  },
  { id:'M4',  label:'M4 – Horizontal Filmstrip',  desc:'Scrollable image cards — visual-first product discovery',                 icon:'🎞️' },
  { id:'M5',  label:'M5 – Accordion Vertical',    desc:'Section accordion on left + right editorial panel',                       icon:'≡'  },
  { id:'M6',  label:'M6 – Fullscreen Overlay',    desc:'Graff-style full viewport dark takeover — most dramatic',                 icon:'⬛' },
  { id:'M7',  label:'M7 – Tabbed Mega',           desc:'Tab bar switches between Jewellery / Diamonds / Collections',             icon:'⊞'  },
  { id:'M8',  label:'M8 – Dual Panel + Products', desc:'Left categories + right live featured products from API',                 icon:'↔️' },
  { id:'M9',  label:'M9 – Magazine Editorial',    desc:'Big hero left with story text + right link list',                         icon:'📰' },
  { id:'M10', label:'M10 – Tooltip Preview',      desc:'Small floating card tooltip — no dropdown, clean minimal',                icon:'💬' },
  { id:'M11', label:'M11 – Split Screen',         desc:'Full-width: left dark list + right full-bleed image',                     icon:'⬜' },
  { id:'M12', label:'M12 – GCC Regional',         desc:'Live gold rate bar + EN/AR toggle + Arabic RTL labels',                   icon:'🌙' },
];

const HEADER_STYLES = [
  { id:'mega',     label:'Mega Menu',     desc:'Full-width hover panel with image — Cartier/Palmiero style', icon:'🏛️', preview:'LOGO  Jewellery  Diamonds  Bespoke  Heritage' },
  { id:'standard', label:'Standard',      desc:'Horizontal nav, simple dropdowns, no image panel',          icon:'📐', preview:'LOGO ─────────────────────── Search ❤ WA' },
  { id:'centered', label:'Centered Logo', desc:'Logo centered, navigation split left and right',             icon:'⬛', preview:'Jewellery  Diamonds │ LOGO │ Bespoke  Heritage' },
  { id:'minimal',  label:'Minimal',       desc:'Logo + hamburger only — ultra-clean luxury look',            icon:'—',  preview:'LOGO ──────────────────────────────── ☰' },
];

const FOOTER_STYLES = [
  { id:'full',       label:'Full Footer',  desc:'4 columns, newsletter strip, certification logos, social', icon:'🗂️' },
  { id:'compact',    label:'Compact',      desc:'3 columns, no newsletter strip, lighter feel',              icon:'📋' },
  { id:'minimal',    label:'Minimal',      desc:'2 columns, logo + links only, copyright bar',               icon:'—'  },
  { id:'single_row', label:'Single Row',   desc:'One line: logo · links · copyright · social icons',         icon:'▬'  },
];

const PRODUCT_LAYOUTS = [
  { id:'cartier',    label:'Cartier Style',  desc:'Full-width hero image, specs below, sticky enquire', icon:'💎' },
  { id:'split',      label:'Split View',     desc:'Image left sticky, details scroll on right',         icon:'↔️' },
  { id:'grid',       label:'Grid Gallery',   desc:'2×2 image grid, description beside',                 icon:'⊞'  },
  { id:'minimal',    label:'Minimal',        desc:'Clean centered, single image, minimal text',          icon:'○'  },
  { id:'magazine',   label:'Magazine',       desc:'Editorial full-bleed, story-style layout',            icon:'📰' },
  { id:'fullscreen', label:'Fullscreen',     desc:'Image 70vw, slim sidebar with price + enquire',       icon:'⛶'  },
];

const LISTING_LAYOUTS = [
  { id:'grid_4',       label:'4-Col Grid',    icon:'⊞' },
  { id:'grid_3',       label:'3-Col Grid',    icon:'⊟' },
  { id:'grid_2',       label:'2-Col Grid',    icon:'▬' },
  { id:'list',         label:'List View',     icon:'☰' },
  { id:'left_sidebar', label:'Left Sidebar',  icon:'◧' },
  { id:'right_sidebar',label:'Right Sidebar', icon:'◨' },
];

export default function ThemeEditorPage() {
  const { collapsed } = useOutletContext() || {};
  const [activeTab,   setActiveTab]   = useState('themes');
  const [activeTheme, setActiveTheme] = useState(null);
  const [customConfig,setCustomConfig]= useState({});
  const [previewSize, setPreviewSize] = useState('desktop');
  const [catFilter,   setCatFilter]   = useState('All');
  const [saving,      setSaving]      = useState(false);
  const [isDirty,     setIsDirty]     = useState(false);
  const [savedTheme,  setSavedTheme]  = useState(null);
  const [useIframe,   setUseIframe]   = useState(false);
  const iframeRef = useRef();

  useEffect(() => {
    api.get('/settings').then(r => {
      const map = {};
      (r.data.data||[]).forEach(s => {
        map[s.key] = typeof s.value === 'string' ? s.value.replace(/^"|"$/g,'') : String(s.value||'');
      });
      const themeId = map.storefront_theme || map.storefront_template || 'cartier-noir';
      const theme   = THEMES.find(t => t.id === themeId) || THEMES[0];
      setActiveTheme(theme);
      setSavedTheme(theme.id);
      setCustomConfig({
        accent_color:      map.theme_accent_color      || theme.colors.accent,
        bg_color:          map.theme_bg_color          || theme.colors.bg,
        heading_font:      map.theme_heading_font      || theme.fonts.heading,
        body_font:         map.theme_body_font         || theme.fonts.body,
        button_radius:     map.theme_button_radius     || theme.buttons.radius,
        nav_topbar:        map.theme_nav_topbar        !== undefined ? map.theme_nav_topbar : String(theme.nav.topBar),
        topbar_text:       map.theme_topbar_text       || 'Free shipping above AED 500 · GIA & IGI Certified',
        topbar_bg:         map.theme_topbar_bg         || theme.nav.topBarBg,
        hero_layout:       map.theme_hero_layout       || theme.hero.layout,
        hero_overlay:      map.theme_hero_overlay      || String(theme.hero.overlayOpacity),
        footer_columns:    map.theme_footer_columns    || '4',
        footer_newsletter: map.theme_footer_newsletter || 'false',
        footer_social:     map.theme_footer_social     || 'true',
        header_style:      map.theme_header_style      || 'mega',
        menu_style:        map.menu_style              || 'M1',
        footer_style:      map.theme_footer_style      || 'full',
        nav_style:         map.theme_nav_style         || 'transparent-scroll',
        sticky_header:     map.theme_sticky_header     || 'true',
        back_to_top:       map.theme_back_to_top       || 'true',
        product_layout:    map.theme_product_layout    || 'cartier',
        listing_layout:    map.theme_listing_layout    || 'grid_4',
        dark_mode:         map.theme_dark_mode         || 'false',
      });
    }).catch(() => {});
  }, []);

  const set = (k, v) => { setCustomConfig(c => ({ ...c, [k]: v })); setIsDirty(true); };

  const applyTheme = (theme) => {
    setActiveTheme(theme);
    setCustomConfig(c => ({
      ...c,
      accent_color:  theme.colors.accent,
      bg_color:      theme.colors.bg,
      heading_font:  theme.fonts.heading,
      body_font:     theme.fonts.body,
      button_radius: theme.buttons.radius,
      nav_topbar:    String(theme.nav.topBar),
      topbar_bg:     theme.nav.topBarBg,
      hero_layout:   theme.hero.layout,
      hero_overlay:  String(theme.hero.overlayOpacity),
    }));
    setIsDirty(true);
    toast.success(`Theme "${theme.name}" applied — save to publish`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = [
        { key:'storefront_theme',        value: activeTheme?.id || 'cartier-noir' },
        { key:'storefront_template',     value: activeTheme?.id || 'cartier-noir' },
        { key:'theme_accent_color',      value: customConfig.accent_color      || '' },
        { key:'theme_bg_color',          value: customConfig.bg_color          || '' },
        { key:'theme_heading_font',      value: customConfig.heading_font      || '' },
        { key:'theme_body_font',         value: customConfig.body_font         || '' },
        { key:'theme_button_radius',     value: customConfig.button_radius     || '' },
        { key:'theme_nav_topbar',        value: customConfig.nav_topbar        || 'true' },
        { key:'theme_topbar_text',       value: customConfig.topbar_text       || '' },
        { key:'theme_topbar_bg',         value: customConfig.topbar_bg         || '' },
        { key:'theme_hero_layout',       value: customConfig.hero_layout       || 'fullscreen' },
        { key:'theme_hero_overlay',      value: customConfig.hero_overlay      || '60' },
        { key:'theme_footer_columns',    value: customConfig.footer_columns    || '4' },
        { key:'theme_footer_newsletter', value: customConfig.footer_newsletter || 'false' },
        { key:'theme_footer_social',     value: customConfig.footer_social     || 'true' },
        { key:'theme_header_style',      value: customConfig.header_style      || 'mega' },
        { key:'menu_style',             value: customConfig.menu_style         || 'M1'   },
        { key:'theme_footer_style',      value: customConfig.footer_style      || 'full' },
        { key:'theme_nav_style',         value: customConfig.nav_style         || 'transparent-scroll' },
        { key:'theme_sticky_header',     value: customConfig.sticky_header     || 'true' },
        { key:'theme_back_to_top',       value: customConfig.back_to_top       || 'true' },
        { key:'theme_product_layout',    value: customConfig.product_layout    || 'cartier' },
        { key:'theme_listing_layout',    value: customConfig.listing_layout    || 'grid_4' },
        { key:'theme_dark_mode',         value: customConfig.dark_mode         || 'false' },
      ];
      await api.post('/settings/bulk', { settings });
      setSavedTheme(activeTheme?.id);
      setIsDirty(false);
      if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
      toast.success('Theme saved & published to storefront');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const resetToTheme = () => { if (activeTheme) { applyTheme(activeTheme); toast('Reset to theme defaults'); } };
  const filteredThemes = catFilter === 'All' ? THEMES : THEMES.filter(t => t.category === catFilter);
  const lbl = 'block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';
  const inp = 'input-field text-sm';

  return (
    <>
      <Topbar
        title="Theme editor"
        subtitle={activeTheme ? `Active: ${activeTheme.name}${isDirty ? ' · Unsaved changes' : ''}` : 'Pick a theme'}
        actions={
          <div className="flex items-center gap-2">
            {isDirty && (
              <button onClick={resetToTheme} className="btn-ghost flex items-center gap-1.5 text-xs">
                <RotateCcw size={12}/> Reset
              </button>
            )}
            <button onClick={() => setUseIframe(v => !v)} className="btn-ghost flex items-center gap-1.5 text-xs">
              <Eye size={12}/> {useIframe ? 'Mock preview' : 'Live preview'}
            </button>
            <button onClick={handleSave} disabled={saving}
              className={`btn-gold flex items-center gap-1.5 text-xs ${isDirty ? 'ring-2 ring-gold-300' : ''} disabled:opacity-50`}>
              <Save size={13}/>{saving ? 'Saving…' : 'Save & publish'}
            </button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">

        {/* LEFT PANEL */}
        <div className="w-72 flex-shrink-0 border-r border-ink-200/60 dark:border-ink-800 flex flex-col bg-white dark:bg-ink-900 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-ink-200/60 dark:border-ink-800 px-2 pt-2 gap-1 hide-scrollbar flex-shrink-0">
            {SECTION_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-t-lg text-[10px] font-medium whitespace-nowrap transition-all flex-shrink-0 border-b-2 ${activeTab === tab.id ? 'border-gold-500 text-gold-600 bg-gold-50/50 dark:bg-gold-900/10' : 'border-transparent text-ink-400 hover:text-ink-600'}`}>
                <tab.icon size={13}/>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* THEMES TAB */}
            {activeTab === 'themes' && (
              <div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {THEME_CATEGORIES.map(cat => (
                    <button key={cat} onClick={() => setCatFilter(cat)}
                      className={`text-[11px] px-3 py-1 rounded-full border font-medium transition-all ${catFilter === cat ? 'bg-gold-500 border-gold-500 text-white' : 'border-ink-200 text-ink-500 hover:border-gold-400'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="space-y-2">
                  {filteredThemes.map(theme => (
                    <button key={theme.id} onClick={() => applyTheme(theme)}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${activeTheme?.id === theme.id ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden relative" style={{ background: theme.preview.bg }}>
                          <div className="absolute inset-x-0 bottom-0 h-4" style={{ background: theme.preview.accent }}/>
                          <div className="absolute top-1.5 left-1.5 right-1.5 h-1.5 rounded-full" style={{ background: theme.preview.text, opacity: 0.6 }}/>
                          {activeTheme?.id === theme.id && savedTheme === theme.id && (
                            <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                              <Check size={8} color="white"/>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-ink-700 dark:text-ink-200">{theme.name}</span>
                            {activeTheme?.id === theme.id && (
                              <span className="text-[9px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full font-bold">Active</span>
                            )}
                          </div>
                          <span className="text-[10px] text-ink-400">{theme.category}</span>
                        </div>
                        <span className="text-lg flex-shrink-0">{theme.thumbnail}</span>
                      </div>
                      <p className="text-[10px] text-ink-400 mt-2 leading-relaxed">{theme.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* HEADER TAB */}
            {activeTab === 'header' && (
              <div className="space-y-5">
                <div>
                  <label className={lbl}>Header style</label>
                  <div className="space-y-2">
                    {HEADER_STYLES.map(s => (
                      <button key={s.id} onClick={() => set('header_style', s.id)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${customConfig.header_style === s.id ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span>{s.icon}</span>
                          <span className="text-xs font-semibold text-ink-700 dark:text-ink-200">{s.label}</span>
                          {customConfig.header_style === s.id && <span className="ml-auto text-[9px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full font-bold">Active</span>}
                        </div>
                        <p className="text-[10px] text-ink-400 mb-2">{s.desc}</p>
                        <div className="px-2 py-1.5 bg-ink-50 dark:bg-ink-800 rounded text-[9px] font-mono text-ink-400 truncate">{s.preview}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* MENU STYLE SELECTOR */}
                <div>
                  <label className={lbl}>Mega Menu Style (M1–M12)</label>
                  <p className="text-[10px] text-ink-400 mb-3">Changes take effect instantly — no rebuild required.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MENU_STYLES.map(s => (
                      <button key={s.id} onClick={() => set('menu_style', s.id)}
                        className={`text-left p-2.5 rounded-xl border-2 transition-all ${customConfig.menu_style === s.id ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-sm">{s.icon}</span>
                          <span className="text-[10px] font-bold text-ink-700 dark:text-ink-200 leading-tight">{s.label}</span>
                          {customConfig.menu_style === s.id && <span className="ml-auto text-[8px] bg-gold-100 text-gold-700 px-1 py-0.5 rounded-full font-bold flex-shrink-0">Active</span>}
                        </div>
                        <p className="text-[9px] text-ink-400 leading-relaxed">{s.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={lbl}>Navigation behaviour</label>
                  <div className="space-y-2">
                    {[['transparent-scroll','Transparent → solid on scroll'],['always-solid','Always solid background'],['white-border','White with bottom border']].map(([v,l]) => (
                      <label key={v} className="flex items-center gap-2.5 p-2.5 bg-ink-50 dark:bg-ink-800 rounded-lg cursor-pointer">
                        <input type="radio" name="nav_style" checked={(customConfig.nav_style||'transparent-scroll')===v} onChange={() => set('nav_style',v)} className="accent-gold-500"/>
                        <span className="text-xs text-ink-600 dark:text-ink-300">{l}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { k:'sticky_header', l:'Sticky header',     d:'Nav stays fixed at top while scrolling' },
                    { k:'back_to_top',   l:'Back to top button',d:'Floating ↑ button after scrolling down' },
                  ].map(item => (
                    <div key={item.k} className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-ink-700 dark:text-ink-200">{item.l}</p>
                        <p className="text-[11px] text-ink-400">{item.d}</p>
                      </div>
                      <Toggle checked={customConfig[item.k]==='true'} onChange={v => set(item.k, v?'true':'false')}/>
                    </div>
                  ))}
                </div>

                <div className="border-t border-ink-100 dark:border-ink-800 pt-4 space-y-3">
                  <label className={lbl}>Announcement bar</label>
                  <div className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Show announcement bar</p>
                      <p className="text-[11px] text-ink-400">Strip above navigation</p>
                    </div>
                    <Toggle checked={customConfig.nav_topbar === 'true'} onChange={v => set('nav_topbar', v ? 'true' : 'false')}/>
                  </div>
                  {customConfig.nav_topbar === 'true' && (
                    <>
                      <div>
                        <label className={lbl}>Bar text</label>
                        <input value={customConfig.topbar_text||''} onChange={e => set('topbar_text', e.target.value)} className={inp} placeholder="Free shipping above AED 500 · GIA certified"/>
                      </div>
                      <div>
                        <label className={lbl}>Bar background</label>
                        <div className="flex gap-2 flex-wrap">
                          {['#c9a84c','#1a1a1a','#0a0a0a','#3d2b1a','#1e293b','#0d3333','#4caf70','#c07060'].map(color => (
                            <button key={color} onClick={() => set('topbar_bg', color)} style={{ background: color }}
                              className={`w-8 h-8 rounded-full border-2 transition-all ${customConfig.topbar_bg === color ? 'border-gold-500 scale-110' : 'border-transparent hover:scale-105'}`}/>
                          ))}
                          <input type="color" value={customConfig.topbar_bg||'#c9a84c'} onChange={e => set('topbar_bg', e.target.value)} className="w-8 h-8 rounded-full border border-ink-200 cursor-pointer"/>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* FOOTER TAB */}
            {activeTab === 'footer' && (
              <div className="space-y-5">
                <div>
                  <label className={lbl}>Footer style</label>
                  <div className="space-y-2">
                    {FOOTER_STYLES.map(s => (
                      <button key={s.id} onClick={() => set('footer_style', s.id)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${customConfig.footer_style === s.id ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                        <div className="flex items-center gap-2">
                          <span>{s.icon}</span>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-ink-700 dark:text-ink-200">{s.label}</p>
                            <p className="text-[10px] text-ink-400">{s.desc}</p>
                          </div>
                          {customConfig.footer_style === s.id && <span className="text-[9px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">Active</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {(customConfig.footer_style === 'full' || customConfig.footer_style === 'compact') && (
                  <div>
                    <label className={lbl}>Columns</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['2','3','4'].map(v => (
                        <button key={v} onClick={() => set('footer_columns', v)}
                          className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${customConfig.footer_columns===v?'border-gold-500 bg-gold-50 text-gold-700':'border-ink-200 text-ink-500 hover:border-gold-300'}`}>
                          {v} col
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  {[
                    { k:'footer_newsletter', l:'Newsletter signup',  d:'Email subscription form' },
                    { k:'footer_social',     l:'Social media icons', d:'Instagram, WhatsApp, etc.' },
                  ].map(item => (
                    <div key={item.k} className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                      <div>
                        <p className="text-sm font-medium text-ink-700 dark:text-ink-200">{item.l}</p>
                        <p className="text-[11px] text-ink-400">{item.d}</p>
                      </div>
                      <Toggle checked={customConfig[item.k]==='true'} onChange={v => set(item.k, v?'true':'false')}/>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HERO TAB */}
            {activeTab === 'hero' && (
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Hero layout</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[['fullscreen','📺 Fullscreen'],['split-screen','↔️ Split'],['centered','⬛ Centered'],['search-hero','🔍 Search'],['minimal','— Minimal']].map(([v,l]) => (
                      <button key={v} onClick={() => set('hero_layout', v)}
                        className={`py-2.5 px-3 rounded-xl border text-[11px] font-medium text-center transition-all ${customConfig.hero_layout===v?'border-gold-500 bg-gold-50 text-gold-700':'border-ink-200 text-ink-500 hover:border-gold-300'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Overlay opacity: {customConfig.hero_overlay||60}%</label>
                  <input type="range" min="0" max="90" step="5" value={customConfig.hero_overlay||60}
                    onChange={e => set('hero_overlay', e.target.value)} className="w-full accent-gold-500"/>
                  <div className="flex justify-between text-[10px] text-ink-400 mt-1"><span>No overlay</span><span>Dark</span></div>
                </div>
              </div>
            )}

            {/* LAYOUTS TAB */}
            {activeTab === 'layout' && (
              <div className="space-y-6">
                {/* PLP */}
                <div>
                  <label className={lbl}>Product Listing Layout (PLP)</label>
                  <p className="text-[10px] text-ink-400 mb-3">How /jewellery catalog displays — active immediately, no rebuild</p>
                  <div className="space-y-2">
                    {[
                      { id:'plp1', label:'PLP1 – BlueNile',         ascii:'[FILTER] [=][=][=]\n         [=][=][=]\n         Load More', desc:'Left sidebar 280px + 3-col grid + pagination' },
                      { id:'plp2', label:'PLP2 – TopBar',            ascii:'[CAT▾][METAL▾][PRICE▾]  Sort▾\n[=][=][=][=]\n[=][=][=][=]',   desc:'Sticky filter dropdowns + 4-col grid' },
                      { id:'plp3', label:'PLP3 – Editorial Sidebar', ascii:'[img] Rings     [=][=][=]\n[img] Necklaces [=][=][=]\n[img] Bracelets [=][=][=]', desc:'Category/collection thumbnails nav + 3-col' },
                      { id:'plp4', label:'PLP4 – Masonry',           ascii:'[▆][▅▅][▇]\n[▇▇][▅][▆]\n[▅][▇][▅▅]', desc:'CSS columns masonry, variable-height cards' },
                      { id:'plp5', label:'PLP5 – Collection Story',  ascii:'█████ HERO BANNER █████\n[chip][chip][chip]\n[=][=][=]', desc:'Full editorial hero + sticky filter chips' },
                      { id:'plp6', label:'PLP6 – Shop the Look',     ascii:'LOOK IMAGE  ① Ring\n  ①②③     ② Necklace\n            ③ Bracelet', desc:'55/45 split: look image + numbered product list' },
                      { id:'plp7', label:'PLP7 – Infinite Scroll',   ascii:'[=][=][=]\n[=][=][=]\n  ● ● ●  ← auto-loads', desc:'Intersection Observer, fade-in items, gold dots' },
                      { id:'plp8', label:'PLP8 – Quick Shop',        ascii:'[=][=][=]\n  hover→[WA | View slides up]\n[=][=][=]', desc:'Hover reveals slide-up panel: WA + view CTA' },
                    ].map(s => (
                      <button key={s.id} onClick={() => set('plp_style', s.id)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${customConfig.plp_style === s.id ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                        <div className="flex items-start gap-3">
                          <pre className="text-[8px] text-ink-400 dark:text-ink-500 leading-tight font-mono whitespace-pre flex-shrink-0 bg-ink-100 dark:bg-ink-800 rounded px-2 py-1 mt-0.5">{s.ascii}</pre>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-ink-700 dark:text-ink-200">{s.label}</p>
                            <p className="text-[10px] text-ink-400 leading-snug">{s.desc}</p>
                          </div>
                          {customConfig.plp_style === s.id && <span className="text-[9px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 mt-1">Active</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* PDP */}
                <div className="border-t border-ink-100 dark:border-ink-800 pt-5">
                  <label className={lbl}>Product Detail Layout (PDP)</label>
                  <p className="text-[10px] text-ink-400 mb-3">Layout for individual product pages — active immediately, no rebuild</p>
                  <div className="space-y-2">
                    {[
                      { id:'pdp1', label:'PDP1 – Cartier',   ascii:'[MEDIA 55%] [INFO 45%▲]\n             Name\n             Price\n             [WA][♥]', desc:'55/45 split, sticky info panel, MediaViewer' },
                      { id:'pdp2', label:'PDP2 – Tiffany',   ascii:'████ FULL-WIDTH HERO ████\n[1][2][3] thumbnails\n   CENTERED NAME + CTA', desc:'Full-width hero, centered info below, thumb strip' },
                      { id:'pdp3', label:'PDP3 – Graff',     ascii:'████ 100vh HERO ████\n  Name · Price overlay\n  ↓ scroll for details', desc:'100vh dark hero with overlay info, scroll reveals specs' },
                      { id:'pdp4', label:'PDP4 – Magazine',  ascii:'[IMG]  Name\n[IMG]  Price\n[IMG]  Specs ►', desc:'Tall stacked images 60%, sticky info 40%' },
                      { id:'pdp5', label:'PDP5 – Split',     ascii:'[IMAGE 50%] | [INFO 50%]\n             Centered\n             Name+CTA', desc:'50/50 100vh, image left, centered info right' },
                      { id:'pdp6', label:'PDP6 – Gallery',   ascii:'[IMG ×2]  [IMG]\n[IMG]     [IMG]\nName — Price   [WA]', desc:'Editorial image grid top, 2-col info below' },
                      { id:'pdp7', label:'PDP7 – Video',     ascii:'[Photos|Video|360°] ← tabs\n[───── VIDEO PLAYER ─────]\nName · Price · CTA below', desc:'MediaViewer prominent: Video/360/Photos tabs at top' },
                      { id:'pdp8', label:'PDP8 – Minimal',   ascii:'   [─── IMAGE ───]\n      Name\n      Price\n    [WA]  [♥]', desc:'Centered single image max 700px, Apple-style whitespace' },
                    ].map(s => (
                      <button key={s.id} onClick={() => set('pdp_style', s.id)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${customConfig.pdp_style === s.id ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                        <div className="flex items-start gap-3">
                          <pre className="text-[8px] text-ink-400 dark:text-ink-500 leading-tight font-mono whitespace-pre flex-shrink-0 bg-ink-100 dark:bg-ink-800 rounded px-2 py-1 mt-0.5">{s.ascii}</pre>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-ink-700 dark:text-ink-200">{s.label}</p>
                            <p className="text-[10px] text-ink-400 leading-snug">{s.desc}</p>
                          </div>
                          {customConfig.pdp_style === s.id && <span className="text-[9px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 mt-1">Active</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-ink-100 dark:border-ink-800 pt-4">
                  <label className={lbl}>Dark mode</label>
                  <div className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Dark storefront</p>
                      <p className="text-[11px] text-ink-400">Applies dark class to storefront</p>
                    </div>
                    <Toggle checked={customConfig.dark_mode==='true'} onChange={v => set('dark_mode', v?'true':'false')}/>
                  </div>
                </div>
              </div>
            )}

            {/* COLORS TAB */}
            {activeTab === 'colors' && (
              <div className="space-y-5">
                <div>
                  <label className={lbl}>Accent / brand color</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {ACCENT_COLORS.map(c => (
                      <button key={c.value} onClick={() => set('accent_color', c.value)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${customConfig.accent_color===c.value?'border-gold-500':'border-transparent hover:border-ink-200'}`}>
                        <div className="w-8 h-8 rounded-full shadow-md" style={{ background: c.value }}/>
                        <span className="text-[9px] text-ink-400 text-center">{c.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="color" value={customConfig.accent_color||'#c9a84c'} onChange={e=>set('accent_color',e.target.value)}
                      className="w-10 h-10 rounded-xl border border-ink-200 cursor-pointer flex-shrink-0"/>
                    <div>
                      <p className="text-xs font-medium text-ink-700 dark:text-ink-200">Custom accent</p>
                      <p className="text-[11px] text-ink-400">Buttons, highlights, links</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={lbl}>Background</label>
                  <div className="grid grid-cols-5 gap-2 mb-2">
                    {['#ffffff','#fafaf8','#0a0a0a','#0f172a','#fdf6ec'].map(c=>(
                      <button key={c} onClick={() => set('bg_color', c)}
                        className={`w-full aspect-square rounded-lg border-2 ${customConfig.bg_color===c?'border-gold-500':'border-ink-200'}`}
                        style={{ background: c }}/>
                    ))}
                  </div>
                  <input type="color" value={customConfig.bg_color||'#ffffff'} onChange={e=>set('bg_color',e.target.value)}
                    className="w-10 h-10 rounded-xl border border-ink-200 cursor-pointer"/>
                </div>

                {activeTheme && (
                  <div className="p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                    <p className="text-[11px] font-medium text-ink-500 mb-2 uppercase tracking-wide">Theme palette</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {Object.entries(activeTheme.colors)
                        .filter(([k]) => !k.toLowerCase().includes('text') && !k.toLowerCase().includes('nav') && !k.toLowerCase().includes('button'))
                        .map(([k,v]) => (
                          <div key={k} title={`${k}: ${v}`}
                            className="w-6 h-6 rounded-full border border-white/20 cursor-pointer hover:scale-110 transition-transform"
                            style={{ background: v }}
                            onClick={() => { if(k==='accent'||k==='accentHover') set('accent_color',v); else set('bg_color',v); }}/>
                        ))
                      }
                    </div>
                    <p className="text-[10px] text-ink-400 mt-2">Click swatch to apply</p>
                  </div>
                )}
              </div>
            )}

            {/* FONTS TAB */}
            {activeTab === 'fonts' && (
              <div className="space-y-5">
                <div>
                  <label className={lbl}>Heading font</label>
                  <p className="text-[10px] text-ink-400 mb-3">Titles, product names, section headings</p>
                  <div className="space-y-2">
                    {FONTS.map(f => (
                      <button key={f.id} onClick={() => set('heading_font', f.id)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${customConfig.heading_font===f.id?'border-gold-500 bg-gold-50 dark:bg-gold-900/20':'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                        <div style={{ fontFamily: f.id, fontSize:15, fontWeight: f.style==='serif'?400:500 }}>{f.label}</div>
                        <div className="text-[10px] text-ink-400 mt-0.5">{f.style === 'serif' ? 'Serif — elegant, luxury' : 'Sans-serif — modern, clean'}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-ink-100 dark:border-ink-800 pt-4">
                  <label className={lbl}>Body font</label>
                  <p className="text-[10px] text-ink-400 mb-3">Descriptions, paragraphs, UI text</p>
                  <div className="space-y-2">
                    {FONTS.map(f => (
                      <button key={f.id} onClick={() => set('body_font', f.id)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${customConfig.body_font===f.id?'border-gold-500 bg-gold-50 dark:bg-gold-900/20':'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                        <div style={{ fontFamily: f.id, fontSize:13 }}>{f.label}</div>
                        <div className="text-[10px] text-ink-400 mt-0.5">{f.style === 'serif' ? 'Serif' : 'Sans-serif'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* BUTTONS TAB */}
            {activeTab === 'buttons' && (
              <div className="space-y-4">
                <label className={lbl}>Button style</label>
                <div className="space-y-3">
                  {[['50px','Pill — fully rounded'],['8px','Rounded — slight curve'],['4px','Semi-rounded'],['2px','Sharp — square corners']].map(([v,l]) => (
                    <button key={v} onClick={() => set('button_radius', v)}
                      className={`w-full p-4 border-2 rounded-xl transition-all flex items-center gap-4 ${customConfig.button_radius===v?'border-gold-500 bg-gold-50 dark:bg-gold-900/20':'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                      <div style={{ background: customConfig.accent_color||'#c9a84c', color:'#fff', padding:'8px 20px', borderRadius:v, fontSize:12, fontWeight:600, whiteSpace:'nowrap' }}>
                        Enquire now
                      </div>
                      <span className="text-xs text-ink-500">{l}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT PANEL — preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-ink-100 dark:bg-ink-950">
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-ink-900 border-b border-ink-200/60 dark:border-ink-800 flex-shrink-0">
            <span className="text-xs font-medium text-ink-500">Preview</span>
            <div className="flex items-center gap-1 bg-ink-100 dark:bg-ink-800 rounded-lg p-1">
              {PREVIEW_SIZES.map(s=>(
                <button key={s.id} onClick={() => setPreviewSize(s.id)} title={s.label}
                  className={`p-1.5 rounded-md transition-all ${previewSize===s.id?'bg-white dark:bg-ink-700 shadow-sm text-gold-600':'text-ink-400 hover:text-ink-600'}`}>
                  <s.icon size={14}/>
                </button>
              ))}
            </div>
            <div className="flex-1 text-xs text-ink-400 font-mono truncate">{import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3011'}</div>
            <a href={import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3011'} target="_blank" rel="noreferrer" className="btn-ghost text-xs flex items-center gap-1.5">
              <Eye size={12}/> Open in tab
            </a>
          </div>

          <div className="flex-1 overflow-auto flex items-start justify-center p-6">
            <div style={{
              width: previewSize==='desktop'?'100%':previewSize==='tablet'?'768px':'390px',
              maxWidth:'100%', minHeight:600,
              transition:'width .3s ease',
              boxShadow: previewSize!=='desktop'?'0 8px 40px rgba(0,0,0,0.2)':'none',
              borderRadius: previewSize!=='desktop'?12:0,
              overflow:'hidden',
            }}>
              {useIframe ? (
                <iframe ref={iframeRef} src={import.meta.env.VITE_STOREFRONT_URL || 'http://localhost:3011'}
                  style={{ width:'100%', height:'100%', minHeight:600, border:'none' }}
                  title="Storefront live preview"/>
              ) : (
                activeTheme && (
                  <div style={{ background: customConfig.bg_color||activeTheme.colors.bg, minHeight:600, fontFamily: customConfig.body_font||activeTheme.fonts.body }}>
                    {customConfig.nav_topbar === 'true' && (
                      <div style={{ background: customConfig.topbar_bg||activeTheme.nav.topBarBg, padding:'6px 20px', textAlign:'center', fontSize:11 }}>
                        <span style={{ color:'#fff', letterSpacing:'0.05em' }}>{customConfig.topbar_text||'Free shipping · GIA & IGI Certified'}</span>
                      </div>
                    )}
                    <div style={{ background: activeTheme.colors.navBg, padding:'14px 24px', display:'flex', alignItems:'center', justifyContent: customConfig.header_style==='centered'?'center':'space-between', borderBottom:`1px solid ${activeTheme.colors.border}`, gap:16, height:56 }}>
                      {customConfig.header_style === 'centered' && <div style={{ display:'flex', gap:14 }}>{['Jewellery','Diamonds'].map(n=><span key={n} style={{ fontSize:11, color:activeTheme.colors.textMuted }}>{n}</span>)}</div>}
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:20, height:20, background: customConfig.accent_color||activeTheme.colors.accent, borderRadius:3 }}/>
                        <span style={{ fontFamily:customConfig.heading_font||activeTheme.fonts.heading, fontSize:15, fontWeight:activeTheme.fonts.headingWeight, color:activeTheme.colors.text }}>TEJORI</span>
                      </div>
                      {customConfig.header_style !== 'minimal' && customConfig.header_style !== 'centered' && (
                        <div style={{ display:'flex', gap:14 }}>{['Diamonds','Jewellery','Bespoke','Heritage'].map(n=><span key={n} style={{ fontSize:11, color:activeTheme.colors.textMuted }}>{n}</span>)}</div>
                      )}
                      {customConfig.header_style === 'centered' && <div style={{ display:'flex', gap:14 }}>{['Bespoke','Heritage'].map(n=><span key={n} style={{ fontSize:11, color:activeTheme.colors.textMuted }}>{n}</span>)}</div>}
                      {customConfig.header_style === 'minimal' && <span style={{ fontSize:18, color:activeTheme.colors.text }}>☰</span>}
                    </div>
                    <div style={{ background:`linear-gradient(135deg,${customConfig.bg_color||activeTheme.colors.bg} 0%,${activeTheme.colors.bgSecondary} 100%)`, padding:previewSize==='mobile'?'36px 16px':'64px 32px', textAlign:'center', borderBottom:`1px solid ${activeTheme.colors.border}` }}>
                      <div style={{ fontSize:9, color:customConfig.accent_color||activeTheme.colors.accent, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:10 }}>Fine Jewellery</div>
                      <div style={{ fontFamily:customConfig.heading_font||activeTheme.fonts.heading, fontSize:previewSize==='mobile'?22:36, fontWeight:activeTheme.fonts.headingWeight, color:activeTheme.colors.text, lineHeight:1.1, marginBottom:12 }}>Diamonds of Distinction</div>
                      <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:20 }}>
                        <div style={{ background:customConfig.accent_color||activeTheme.colors.accent, color:'#fff', padding:'9px 20px', borderRadius:customConfig.button_radius||activeTheme.buttons.radius, fontSize:11, fontWeight:600 }}>Enquire on WhatsApp</div>
                        <div style={{ border:`1px solid ${activeTheme.colors.border}`, color:activeTheme.colors.text, padding:'9px 20px', borderRadius:customConfig.button_radius||activeTheme.buttons.radius, fontSize:11 }}>Book Appointment</div>
                      </div>
                    </div>
                    <div style={{ padding:'20px 16px' }}>
                      <div style={{ fontFamily:customConfig.heading_font||activeTheme.fonts.heading, fontSize:18, color:activeTheme.colors.text, textAlign:'center', marginBottom:16 }}>Featured Pieces</div>
                      <div style={{ display:'grid', gridTemplateColumns:`repeat(${previewSize==='mobile'?2:3},1fr)`, gap:10 }}>
                        {['💎','📿','💜'].map((icon,i)=>(
                          <div key={i} style={{ background:activeTheme.colors.bgCard||activeTheme.colors.bgSecondary, borderRadius:8, overflow:'hidden', border:`1px solid ${activeTheme.colors.border}` }}>
                            <div style={{ aspectRatio:'1', background:`linear-gradient(135deg,${activeTheme.colors.bgSecondary},${customConfig.bg_color||activeTheme.colors.bg})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>{icon}</div>
                            <div style={{ padding:10 }}>
                              <div style={{ fontSize:11, fontFamily:customConfig.heading_font||activeTheme.fonts.heading, color:activeTheme.colors.text, marginBottom:4 }}>{['Diamond Ring','Pearl Necklace','Sapphire Bangle'][i]}</div>
                              <div style={{ fontSize:12, fontWeight:700, color:customConfig.accent_color||activeTheme.colors.accent }}>AED {(12000+i*3000).toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ background:customConfig.footer_style==='full'?'#1a1a1a':activeTheme.colors.bgSecondary, padding:'16px 20px', borderTop:`1px solid ${activeTheme.colors.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
                      <span style={{ fontFamily:customConfig.heading_font||activeTheme.fonts.heading, fontSize:13, color:customConfig.footer_style==='full'?'#fff':activeTheme.colors.text }}>TEJORI</span>
                      <div style={{ display:'flex', gap:12 }}>
                        {(customConfig.footer_style==='single_row'?['Home','Jewellery','Contact']:['Diamonds','Jewellery','About','Contact']).map(l=>(
                          <span key={l} style={{ fontSize:10, color:customConfig.footer_style==='full'?'#6b6661':activeTheme.colors.textMuted }}>{l}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="px-6 py-2.5 bg-white dark:bg-ink-900 border-t border-ink-200/60 dark:border-ink-800 flex items-center justify-between flex-shrink-0">
            <p className="text-[11px] text-ink-400">
              {useIframe ? 'Live storefront — changes visible after Save & publish.' : 'Mock preview — click "Live preview" for real storefront iframe.'}
            </p>
            {isDirty && <p className="text-[11px] text-amber-600 font-medium">● Unsaved changes</p>}
          </div>
        </div>

      </div>
    </>
  );
}
