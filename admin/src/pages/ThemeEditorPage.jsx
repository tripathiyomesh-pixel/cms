import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import Topbar from '../components/layout/Topbar';
import Toggle from '../components/ui/Toggle';
import { THEMES, THEME_CATEGORIES } from '../data/themes';
import api from '../services/api';
import {
  Save, Eye, EyeOff, Paintbrush, Type, Layout, Monitor,
  Tablet, Smartphone, ChevronRight, Check, RotateCcw,
  Sun, Moon, Sliders, Image, AlignLeft, AlignCenter,
} from 'lucide-react';
import toast from 'react-hot-toast';

const SECTION_TABS = [
  { id:'themes',  label:'Themes',    icon:Paintbrush },
  { id:'header',  label:'Header',    icon:Layout },
  { id:'hero',    label:'Hero',      icon:Image },
  { id:'colors',  label:'Colors',    icon:Sliders },
  { id:'fonts',   label:'Typography',icon:Type },
  { id:'buttons', label:'Buttons',   icon:AlignCenter },
  { id:'footer',  label:'Footer',    icon:Layout },
];

const PREVIEW_SIZES = [
  { id:'desktop', icon:Monitor,    w:'100%',  label:'Desktop' },
  { id:'tablet',  icon:Tablet,     w:'768px', label:'Tablet' },
  { id:'mobile',  icon:Smartphone, w:'390px', label:'Mobile' },
];

const FONTS = [
  { id:"'Playfair Display', Georgia, serif",        label:'Playfair Display',  preview:'Playfair Display',  style:'serif' },
  { id:"'Cormorant Garamond', Georgia, serif",      label:'Cormorant Garamond',preview:'Cormorant Garamond',style:'serif' },
  { id:"'Inter', system-ui, sans-serif",            label:'Inter',             preview:'Inter',             style:'sans' },
  { id:"'DM Serif Display', Georgia, serif",        label:'DM Serif Display',  preview:'DM Serif',          style:'serif' },
  { id:"'Josefin Sans', system-ui, sans-serif",     label:'Josefin Sans',      preview:'Josefin Sans',      style:'sans' },
  { id:"'Lato', system-ui, sans-serif",             label:'Lato',              preview:'Lato',              style:'sans' },
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

export default function ThemeEditorPage() {
  const { collapsed } = useOutletContext() || {};
  const [activeTab,    setActiveTab]    = useState('themes');
  const [activeTheme,  setActiveTheme]  = useState(null);
  const [customConfig, setCustomConfig] = useState({});
  const [previewSize,  setPreviewSize]  = useState('desktop');
  const [catFilter,    setCatFilter]    = useState('All');
  const [saving,       setSaving]       = useState(false);
  const [isDirty,      setIsDirty]      = useState(false);
  const [savedTheme,   setSavedTheme]   = useState(null);
  const iframeRef = useRef();

  useEffect(() => {
    // Load current theme from settings
    api.get('/settings').then(r => {
      const map = {};
      (r.data.data||[]).forEach(s => {
        map[s.key] = typeof s.value === 'string' ? s.value.replace(/^"|"$/g,'') : String(s.value||'');
      });
      const themeId = map.storefront_theme || map.storefront_template || 'cartier-noir';
      const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
      setActiveTheme(theme);
      setSavedTheme(theme.id);
      // Load any customizations
      setCustomConfig({
        accent_color:       map.theme_accent_color      || theme.colors.accent,
        bg_color:           map.theme_bg_color          || theme.colors.bg,
        heading_font:       map.theme_heading_font      || theme.fonts.heading,
        body_font:          map.theme_body_font         || theme.fonts.body,
        button_radius:      map.theme_button_radius     || theme.buttons.radius,
        nav_topbar:         map.theme_nav_topbar        !== undefined ? map.theme_nav_topbar : String(theme.nav.topBar),
        topbar_text:        map.theme_topbar_text       || 'Free shipping above AED 500 · GIA & IGI Certified',
        topbar_bg:          map.theme_topbar_bg         || theme.nav.topBarBg,
        hero_layout:        map.theme_hero_layout       || theme.hero.layout,
        hero_overlay:       map.theme_hero_overlay      || String(theme.hero.overlayOpacity),
        footer_columns:     map.theme_footer_columns    || '4',
        footer_newsletter:  map.theme_footer_newsletter || 'false',
        footer_social:      map.theme_footer_social     || 'true',
      });
    }).catch(() => {});
  }, []);

  const set = (k, v) => { setCustomConfig(c => ({ ...c, [k]: v })); setIsDirty(true); };

  const applyTheme = (theme) => {
    setActiveTheme(theme);
    setCustomConfig(c => ({
      ...c,
      accent_color:   theme.colors.accent,
      bg_color:       theme.colors.bg,
      heading_font:   theme.fonts.heading,
      body_font:      theme.fonts.body,
      button_radius:  theme.buttons.radius,
      nav_topbar:     String(theme.nav.topBar),
      topbar_bg:      theme.nav.topBarBg,
      hero_layout:    theme.hero.layout,
      hero_overlay:   String(theme.hero.overlayOpacity),
    }));
    setIsDirty(true);
    toast.success(`Theme "${theme.name}" applied — save to publish`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = [
        { key:'storefront_theme',       value: activeTheme?.id || 'cartier-noir' },
        { key:'storefront_template',    value: activeTheme?.id || 'cartier-noir' },
        { key:'theme_accent_color',     value: customConfig.accent_color || '' },
        { key:'theme_bg_color',         value: customConfig.bg_color || '' },
        { key:'theme_heading_font',     value: customConfig.heading_font || '' },
        { key:'theme_body_font',        value: customConfig.body_font || '' },
        { key:'theme_button_radius',    value: customConfig.button_radius || '' },
        { key:'theme_nav_topbar',       value: customConfig.nav_topbar || 'true' },
        { key:'theme_topbar_text',      value: customConfig.topbar_text || '' },
        { key:'theme_topbar_bg',        value: customConfig.topbar_bg || '' },
        { key:'theme_hero_layout',      value: customConfig.hero_layout || 'fullscreen' },
        { key:'theme_hero_overlay',     value: customConfig.hero_overlay || '60' },
        { key:'theme_footer_columns',   value: customConfig.footer_columns || '4' },
        { key:'theme_footer_newsletter',value: customConfig.footer_newsletter || 'false' },
        { key:'theme_footer_social',    value: customConfig.footer_social || 'true' },
      ];
      await api.post('/settings/bulk', { settings });
      setSavedTheme(activeTheme?.id);
      setIsDirty(false);
      toast.success('Theme saved — rebuild storefront to publish');
    } catch { toast.error('Save failed'); }
    setSaving(false);
  };

  const resetToTheme = () => {
    if (!activeTheme) return;
    applyTheme(activeTheme);
    toast('Reset to theme defaults');
  };

  const filteredThemes = catFilter === 'All' ? THEMES : THEMES.filter(t => t.category === catFilter);

  const lbl = 'block text-[11px] font-medium text-ink-500 dark:text-ink-400 mb-1.5 uppercase tracking-wide';
  const inp = 'input-field text-sm';

  // Live preview URL
  const previewUrl = `http://localhost:3001?theme_preview=${activeTheme?.id || ''}&accent=${encodeURIComponent(customConfig.accent_color||'')}`;

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
            <button onClick={handleSave} disabled={saving}
              className={`btn-gold flex items-center gap-1.5 text-xs ${isDirty ? 'ring-2 ring-gold-300' : ''} disabled:opacity-50`}>
              <Save size={13}/>{saving ? 'Saving…' : 'Save & publish'}
            </button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT PANEL — section tabs + controls ─────────── */}
        <div className="w-72 flex-shrink-0 border-r border-ink-200/60 dark:border-ink-800 flex flex-col bg-white dark:bg-ink-900 overflow-hidden">
          {/* Section tabs */}
          <div className="flex overflow-x-auto border-b border-ink-200/60 dark:border-ink-800 px-2 pt-2 gap-1 hide-scrollbar flex-shrink-0">
            {SECTION_TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-t-lg text-[10px] font-medium whitespace-nowrap transition-all flex-shrink-0 border-b-2 ${activeTab === tab.id ? 'border-gold-500 text-gold-600 bg-gold-50/50 dark:bg-gold-900/10' : 'border-transparent text-ink-400 hover:text-ink-600'}`}>
                <tab.icon size={14}/>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Section content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">

            {/* ── THEMES PANEL ─────────────────────────────── */}
            {activeTab === 'themes' && (
              <div>
                {/* Category filter */}
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
                        {/* Color preview */}
                        <div className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden relative"
                          style={{ background: theme.preview.bg }}>
                          <div className="absolute inset-x-0 bottom-0 h-4" style={{ background: theme.preview.accent }}/>
                          <div className="absolute top-1.5 left-1.5 right-1.5 h-1.5 rounded-full"
                            style={{ background: theme.preview.text, opacity: 0.6 }}/>
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

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">
                    <strong>1-click apply:</strong> Click any theme to preview it instantly. Customise colors, fonts, and sections in the other tabs. Save to publish.
                  </p>
                </div>
              </div>
            )}

            {/* ── HEADER PANEL ─────────────────────────────── */}
            {activeTab === 'header' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Announcement bar</p>
                    <p className="text-[11px] text-ink-400">Strip above navigation</p>
                  </div>
                  <Toggle checked={customConfig.nav_topbar === 'true'} onChange={v => set('nav_topbar', v ? 'true' : 'false')}/>
                </div>
                {customConfig.nav_topbar === 'true' && (
                  <>
                    <div><label className={lbl}>Bar text</label>
                      <input value={customConfig.topbar_text||''} onChange={e => set('topbar_text', e.target.value)} className={inp} placeholder="Free shipping above AED 500 · GIA certified"/>
                    </div>
                    <div><label className={lbl}>Bar background color</label>
                      <div className="flex gap-2 flex-wrap">
                        {['#c9a84c','#1a1a1a','#0a0a0a','#3d2b1a','#1e293b','#0d3333','#4caf70','#c07060'].map(color => (
                          <button key={color} onClick={() => set('topbar_bg', color)}
                            style={{ background: color }}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${customConfig.topbar_bg === color ? 'border-gold-500 scale-110' : 'border-transparent hover:scale-105'}`}/>
                        ))}
                        <input type="color" value={customConfig.topbar_bg||'#c9a84c'} onChange={e => set('topbar_bg', e.target.value)}
                          className="w-8 h-8 rounded-full border border-ink-200 cursor-pointer" title="Custom color"/>
                      </div>
                    </div>
                  </>
                )}
                <div><label className={lbl}>Navigation style</label>
                  <div className="space-y-2">
                    {[['transparent-scroll','Transparent → solid on scroll (hero pages)'],['always-solid','Always solid background'],['white-border','White with bottom border']].map(([v,l]) => (
                      <label key={v} className="flex items-center gap-2.5 p-2.5 bg-ink-50 dark:bg-ink-800 rounded-lg cursor-pointer">
                        <input type="radio" name="nav_style" checked={(customConfig.nav_style||'transparent-scroll')===v} onChange={() => set('nav_style',v)} className="accent-gold-500"/>
                        <span className="text-xs text-ink-600 dark:text-ink-300">{l}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── HERO PANEL ────────────────────────────────── */}
            {activeTab === 'hero' && (
              <div className="space-y-4">
                <div><label className={lbl}>Hero layout</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[['fullscreen','📺 Fullscreen'],['split-screen','↔️ Split screen'],['centered','⬛ Centered'],['search-hero','🔍 Search hero'],['minimal','—— Minimal']].map(([v,l]) => (
                      <button key={v} onClick={() => set('hero_layout', v)}
                        className={`py-2.5 px-3 rounded-xl border text-[11px] font-medium text-center transition-all ${customConfig.hero_layout===v?'border-gold-500 bg-gold-50 text-gold-700':'border-ink-200 text-ink-500 hover:border-gold-300'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={lbl}>Overlay opacity: {customConfig.hero_overlay||60}%</label>
                  <input type="range" min="0" max="90" step="5"
                    value={customConfig.hero_overlay||60}
                    onChange={e => set('hero_overlay', e.target.value)}
                    className="w-full accent-gold-500"/>
                  <div className="flex justify-between text-[10px] text-ink-400 mt-1"><span>No overlay</span><span>Dark</span></div>
                </div>
              </div>
            )}

            {/* ── COLORS PANEL ──────────────────────────────── */}
            {activeTab === 'colors' && (
              <div className="space-y-5">
                <div>
                  <label className={lbl}>Accent / brand color</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {ACCENT_COLORS.map(c => (
                      <button key={c.value} onClick={() => set('accent_color', c.value)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all ${customConfig.accent_color===c.value?'border-gold-500':'border-transparent hover:border-ink-200'}`}>
                        <div className="w-8 h-8 rounded-full shadow-md" style={{ background: c.value }}/>
                        <span className="text-[9px] text-ink-400 leading-none text-center">{c.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="color" value={customConfig.accent_color||'#c9a84c'} onChange={e=>set('accent_color',e.target.value)}
                      className="w-10 h-10 rounded-xl border border-ink-200 cursor-pointer flex-shrink-0"/>
                    <div>
                      <p className="text-xs font-medium text-ink-700 dark:text-ink-200">Custom color</p>
                      <p className="text-[11px] text-ink-400">Pick any brand color</p>
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
                  <input type="color" value={customConfig.bg_color||'#ffffff'} onChange={e=>set('bg_color',e.target.value)} className="w-10 h-10 rounded-xl border border-ink-200 cursor-pointer"/>
                </div>
              </div>
            )}

            {/* ── FONTS PANEL ───────────────────────────────── */}
            {activeTab === 'fonts' && (
              <div className="space-y-4">
                <div>
                  <label className={lbl}>Heading font</label>
                  <div className="space-y-2">
                    {FONTS.map(f => (
                      <button key={f.id} onClick={() => set('heading_font', f.id)}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${customConfig.heading_font===f.id?'border-gold-500 bg-gold-50 dark:bg-gold-900/20':'border-ink-200 dark:border-ink-700 hover:border-gold-300'}`}>
                        <div style={{ fontFamily: f.id, fontSize:16, fontWeight:f.style==='serif'?400:500, color:'var(--color-text-primary)' }}>{f.preview}</div>
                        <div className="text-[10px] text-ink-400 mt-0.5">{f.style === 'serif' ? 'Serif — elegant' : 'Sans-serif — modern'}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── BUTTONS PANEL ─────────────────────────────── */}
            {activeTab === 'buttons' && (
              <div className="space-y-4">
                <div>
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
              </div>
            )}

            {/* ── FOOTER PANEL ──────────────────────────────── */}
            {activeTab === 'footer' && (
              <div className="space-y-4">
                <div><label className={lbl}>Number of columns</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['2','3','4'].map(v=>(
                      <button key={v} onClick={() => set('footer_columns',v)}
                        className={`py-3 rounded-xl border-2 text-sm font-semibold transition-all ${customConfig.footer_columns===v?'border-gold-500 bg-gold-50 text-gold-700':'border-ink-200 text-ink-500 hover:border-gold-300'}`}>
                        {v} col
                      </button>
                    ))}
                  </div>
                </div>
                {[
                  { k:'footer_newsletter', l:'Newsletter signup', d:'Email subscription form in footer' },
                  { k:'footer_social',     l:'Social media links',d:'Instagram, WhatsApp icons' },
                ].map(item=>(
                  <div key={item.k} className="flex items-center justify-between p-3 bg-ink-50 dark:bg-ink-800 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-ink-700 dark:text-ink-200">{item.l}</p>
                      <p className="text-[11px] text-ink-400">{item.d}</p>
                    </div>
                    <Toggle checked={customConfig[item.k]==='true'} onChange={v=>set(item.k,v?'true':'false')}/>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

        {/* ── RIGHT PANEL — live preview ───────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden bg-ink-100 dark:bg-ink-950">
          {/* Preview toolbar */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-ink-900 border-b border-ink-200/60 dark:border-ink-800 flex-shrink-0">
            <span className="text-xs font-medium text-ink-500 dark:text-ink-400">Preview</span>
            <div className="flex items-center gap-1 bg-ink-100 dark:bg-ink-800 rounded-lg p-1">
              {PREVIEW_SIZES.map(s=>(
                <button key={s.id} onClick={() => setPreviewSize(s.id)}
                  title={s.label}
                  className={`p-1.5 rounded-md transition-all ${previewSize===s.id?'bg-white dark:bg-ink-700 shadow-sm text-gold-600':'text-ink-400 hover:text-ink-600'}`}>
                  <s.icon size={14}/>
                </button>
              ))}
            </div>
            <div className="flex-1 flex items-center">
              <div className="text-xs text-ink-400 font-mono truncate">{previewUrl}</div>
            </div>
            <a href="http://localhost:3001" target="_blank" rel="noreferrer"
              className="btn-ghost text-xs flex items-center gap-1.5">
              <Eye size={12}/> Open live
            </a>
          </div>

          {/* Preview area */}
          <div className="flex-1 overflow-auto flex items-start justify-center p-6">
            <div style={{
              width: previewSize === 'desktop' ? '100%' : previewSize === 'tablet' ? '768px' : '390px',
              maxWidth: '100%',
              transition: 'width .3s ease',
              boxShadow: previewSize !== 'desktop' ? '0 8px 40px rgba(0,0,0,0.2)' : 'none',
              borderRadius: previewSize !== 'desktop' ? 12 : 0,
              overflow: 'hidden',
            }}>
              {/* Theme preview card (static visual, no iframe needed) */}
              {activeTheme && (
                <div style={{ background: activeTheme.colors.bg, minHeight: 500, fontFamily: activeTheme.fonts.body }}>
                  {/* Mock nav */}
                  {customConfig.nav_topbar === 'true' && (
                    <div style={{ background: customConfig.topbar_bg||activeTheme.nav.topBarBg, padding:'6px 20px', textAlign:'center', fontSize:11 }}>
                      <span style={{ color: activeTheme.nav.topBarText||'#fff', letterSpacing:'0.05em' }}>
                        {customConfig.topbar_text||'Free shipping · GIA & IGI Certified'}
                      </span>
                    </div>
                  )}
                  <div style={{ background: activeTheme.colors.navBg, padding:'14px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:`1px solid ${activeTheme.colors.border}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:28,height:28, background: customConfig.accent_color||activeTheme.colors.accent, borderRadius:6 }}/>
                      <span style={{ fontFamily:customConfig.heading_font||activeTheme.fonts.heading, fontSize:16, fontWeight:activeTheme.fonts.headingWeight, color:activeTheme.colors.text }}>
                        {process.env.REACT_APP_STORE_NAME||'JewelCMS'}
                      </span>
                    </div>
                    <div style={{ display:'flex', gap:16 }}>
                      {['Diamonds','Jewellery','Gemstones','Pearls'].map(n=>(
                        <span key={n} style={{ fontSize:12, color:activeTheme.colors.textMuted, fontWeight:500 }}>{n}</span>
                      ))}
                    </div>
                  </div>

                  {/* Mock hero */}
                  <div style={{ background: `linear-gradient(135deg, ${activeTheme.colors.bg} 0%, ${activeTheme.colors.bgSecondary} 100%)`, padding: previewSize==='mobile'?'40px 20px':'80px 40px', textAlign:'center', borderBottom:`1px solid ${activeTheme.colors.border}` }}>
                    <div style={{ fontSize:10, color:customConfig.accent_color||activeTheme.colors.accent, letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:12 }}>Fine Jewellery Collection</div>
                    <div style={{ fontFamily:customConfig.heading_font||activeTheme.fonts.heading, fontSize:previewSize==='mobile'?28:44, fontWeight:activeTheme.fonts.headingWeight, color:activeTheme.colors.text, lineHeight:1.1, marginBottom:16 }}>
                      Diamonds of Distinction
                    </div>
                    <div style={{ fontSize:13, color:activeTheme.colors.textMuted, marginBottom:32, maxWidth:400, margin:'0 auto 32px' }}>
                      GIA & IGI certified natural and lab-grown diamonds
                    </div>
                    <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                      <div style={{ background:customConfig.accent_color||activeTheme.colors.accent, color:activeTheme.colors.buttonText||'#fff', padding:'12px 28px', borderRadius:customConfig.button_radius||activeTheme.buttons.radius, fontSize:12, fontWeight:600 }}>
                        Shop Diamonds
                      </div>
                      <div style={{ border:`1px solid ${activeTheme.colors.border}`, color:activeTheme.colors.text, padding:'12px 28px', borderRadius:customConfig.button_radius||activeTheme.buttons.radius, fontSize:12, fontWeight:500 }}>
                        Book Appointment
                      </div>
                    </div>
                  </div>

                  {/* Mock product grid */}
                  <div style={{ padding:'32px 24px' }}>
                    <div style={{ fontSize:10, color:customConfig.accent_color||activeTheme.colors.accent, letterSpacing:'0.15em', textTransform:'uppercase', textAlign:'center', marginBottom:8 }}>Selection</div>
                    <div style={{ fontFamily:customConfig.heading_font||activeTheme.fonts.heading, fontSize:22, fontWeight:activeTheme.fonts.headingWeight, color:activeTheme.colors.text, textAlign:'center', marginBottom:24 }}>Featured Pieces</div>
                    <div style={{ display:'grid', gridTemplateColumns:`repeat(${previewSize==='mobile'?2:3},1fr)`, gap:12 }}>
                      {['Diamond Ring','Pearl Necklace','Sapphire Bangle'].map((name,i)=>(
                        <div key={name} style={{ background:activeTheme.colors.bgCard||activeTheme.colors.bgSecondary, borderRadius:10, overflow:'hidden', border:`1px solid ${activeTheme.colors.border}` }}>
                          <div style={{ aspectRatio:'1', background:`linear-gradient(135deg,${activeTheme.colors.bgSecondary},${activeTheme.colors.bg})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>
                            {['💎','📿','💜'][i]}
                          </div>
                          <div style={{ padding:'12px' }}>
                            <div style={{ fontSize:11, color:activeTheme.colors.textMuted, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.05em' }}>18K Gold</div>
                            <div style={{ fontSize:13, fontFamily:customConfig.heading_font||activeTheme.fonts.heading, color:activeTheme.colors.text, fontWeight:500, marginBottom:8 }}>{name}</div>
                            <div style={{ fontSize:14, fontWeight:700, color:customConfig.accent_color||activeTheme.colors.accent }}>AED {(12000+i*3000).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mock footer */}
                  <div style={{ background:activeTheme.colors.bgSecondary, padding:'24px', borderTop:`1px solid ${activeTheme.colors.border}`, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
                    <div>
                      <div style={{ fontFamily:customConfig.heading_font||activeTheme.fonts.heading, fontSize:16, color:activeTheme.colors.text, marginBottom:6 }}>JewelCMS</div>
                      <div style={{ fontSize:11, color:activeTheme.colors.textMuted }}>Certified diamonds & fine jewellery</div>
                    </div>
                    <div style={{ display:'flex', gap:20 }}>
                      {['Diamonds','Jewellery','About','Contact'].map(l=>(
                        <span key={l} style={{ fontSize:11, color:activeTheme.colors.textMuted }}>{l}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom hint */}
          <div className="px-6 py-2.5 bg-white dark:bg-ink-900 border-t border-ink-200/60 dark:border-ink-800 flex items-center justify-between flex-shrink-0">
            <p className="text-[11px] text-ink-400">Preview is a mockup. Open localhost:3001 to see the live storefront.</p>
            {isDirty && <p className="text-[11px] text-amber-600 font-medium">● Unsaved changes</p>}
          </div>
        </div>
      </div>
    </>
  );
}
