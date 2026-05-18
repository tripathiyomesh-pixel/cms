'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { THEMES, getThemeById } from '@/lib/themes';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import CookieConsent from '@/components/ui/CookieConsent';
import PopupBuilder from '@/components/ui/PopupBuilder';
import Preloader from '@/components/ui/Preloader';
import { CurrencyProvider } from '@/components/ui/CurrencySwitcher';

const TemplateContext = createContext(null);
export const useTemplateContext = () => useContext(TemplateContext);

export default function TemplateLayout({ children }) {
  const [template,  setTemplate]  = useState(getThemeById('cartier-noir'));
  const [config,    setConfig]    = useState({});
  const [hydrated,  setHydrated]  = useState(false);
  const [maintenance, setMaintenance] = useState(null);

  useEffect(() => {
    setHydrated(true);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

    fetch(`${apiBase}/storefront/frontend-config`)
      .then(r => r.json())
      .then(res => {
        const cfg = res.data || {};
        setConfig(cfg);

        // Apply theme
        const themeId = cfg.storefront_theme || cfg.storefront_template || localStorage.getItem('cms_template') || 'cartier-noir';
        const theme = getThemeById(themeId);
        setTemplate(theme);
        localStorage.setItem('cms_template', themeId);

        // Inject Google Analytics
        if (cfg.google_analytics_id && !document.getElementById('ga-script')) {
          const s = document.createElement('script');
          s.id = 'ga-script';
          s.async = true;
          s.src = `https://www.googletagmanager.com/gtag/js?id=${cfg.google_analytics_id}`;
          document.head.appendChild(s);
          window.dataLayer = window.dataLayer || [];
          window.gtag = function(){window.dataLayer.push(arguments);};
          window.gtag('js', new Date());
          window.gtag('config', cfg.google_analytics_id);
        }

        // Inject custom head code
        if (cfg.custom_head_code) {
          const div = document.createElement('div');
          div.id = 'custom-head-code';
          div.innerHTML = cfg.custom_head_code;
          document.head.appendChild(div);
        }

        // Apply CSS variables from theme
        const root = document.documentElement;
        const t = theme;
        root.style.setProperty('--color-accent',       cfg.theme_accent_color    || t.colors.accent);
        root.style.setProperty('--color-bg',           cfg.theme_bg_color        || t.colors.bg);
        root.style.setProperty('--color-text',         t.colors.text);
        root.style.setProperty('--color-text-muted',   t.colors.textMuted);
        root.style.setProperty('--color-border',       t.colors.border);
        root.style.setProperty('--color-nav-bg',       t.colors.navBg);
        root.style.setProperty('--btn-radius',         cfg.theme_button_radius   || t.buttons?.radius || '8px');
        root.style.setProperty('--font-heading',       cfg.theme_heading_font    || t.fonts.heading);
        root.style.setProperty('--font-body',          cfg.theme_body_font       || t.fonts.body);

        // Maintenance mode — set via state (never touch document.body directly)
        if (cfg.maintenance_enabled === 'true') {
          setMaintenance(cfg.maintenance_message || 'We are updating our collection. Back soon.');
        }
      })
      .catch(() => {});
  }, []);

  const switchTemplate = (id) => {
    const t = getThemeById(id);
    setTemplate(t);
    localStorage.setItem('cms_template', id);
  };

  return (
    <TemplateContext.Provider value={{ template, switchTemplate, config }}>
      <CurrencyProvider>
        {/* Preloader */}
        {hydrated && config.preloader_enabled === 'true' && (
          <Preloader color={config.preloader_color || '#c9a84c'} style={config.preloader_style || 'diamond'}/>
        )}

        <div style={{
          background: template.colors.bg,
          color: template.colors.text,
          fontFamily: template.fonts.body,
          minHeight: '100vh',
        }}>
          <Header template={template} config={config}/>
          <main>{children}</main>
          <Footer template={template} config={config}/>
        </div>

        <WhatsAppButton/>

        {/* Cookie consent */}
        {hydrated && <CookieConsent settings={config}/>}

        {/* Popup */}
        {hydrated && <PopupBuilder settings={config}/>}

        {/* Custom body code — only inject if it's a script tag or safe HTML */}
        {hydrated && config.custom_body_code && (
          <div id="custom-body-code" dangerouslySetInnerHTML={{ __html: config.custom_body_code }}/>
        )}

        {/* Maintenance overlay */}
        {maintenance && (
          <div style={{ position:'fixed',inset:0,zIndex:99999,background:'#0a0a0a',display:'flex',alignItems:'center',justifyContent:'center',padding:40,textAlign:'center',fontFamily:'Georgia,serif' }}>
            <div>
              <div style={{ fontSize:48,marginBottom:24 }}>💎</div>
              <h1 style={{ color:'#c9a84c',fontSize:32,fontWeight:400,marginBottom:16 }}>We'll be back shortly</h1>
              <p style={{ color:'#888',fontSize:16,maxWidth:400,lineHeight:1.6 }}>{maintenance}</p>
            </div>
          </div>
        )}

        {/* Dev template switcher */}
        {hydrated && process.env.NEXT_PUBLIC_SHOW_TEMPLATE_SWITCHER === 'true' && (
          <TemplateSwitcherBar current={template} onSwitch={switchTemplate}/>
        )}
      </CurrencyProvider>
    </TemplateContext.Provider>
  );
}

function TemplateSwitcherBar({ current, onSwitch }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:'fixed', bottom:80, left:16, zIndex:999 }}>
      <button onClick={()=>setOpen(!open)} style={{ background:'#1a1a1a',color:'#c9a84c',border:'1px solid #c9a84c',borderRadius:8,padding:'8px 14px',fontSize:12,fontWeight:600,cursor:'pointer' }}>
        🎨 {current.name}
      </button>
      {open && (
        <div style={{ position:'absolute',bottom:'calc(100% + 8px)',left:0,background:'#1a1a1a',border:'1px solid #333',borderRadius:12,padding:8,minWidth:200,boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
          {THEMES.map(t=>(
            <button key={t.id} onClick={()=>{ onSwitch(t.id); setOpen(false); }}
              style={{ display:'block',width:'100%',padding:'10px 14px',textAlign:'left',background:current.id===t.id?'#2a2a2a':'transparent',border:'none',borderRadius:8,color:current.id===t.id?'#c9a84c':'#f5f0e8',fontSize:13,cursor:'pointer',marginBottom:2 }}>
              {t.thumbnail} {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
