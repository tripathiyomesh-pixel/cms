'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import { TEMPLATES, getTemplate } from '@/lib/templates';
import Header from './Header';
import Footer from './Footer';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

const TemplateContext = createContext(null);
export const useTemplateContext = () => useContext(TemplateContext);

export default function TemplateLayout({ children }) {
  const [template, setTemplate]   = useState(getTemplate());
  const [hydrated, setHydrated]   = useState(false);

  useEffect(() => {
    setHydrated(true);
    // Check localStorage first
    const cached = localStorage.getItem('cms_template');
    if (cached && TEMPLATES[cached]) {
      setTemplate(TEMPLATES[cached]);
      return;
    }
    // Fetch from API settings
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    fetch(`${apiBase}/storefront/store`)
      .then(r => r.json())
      .then(data => {
        const id = data?.data?.storefront_template;
        if (id && TEMPLATES[id]) {
          setTemplate(TEMPLATES[id]);
          localStorage.setItem('cms_template', id);
        }
      })
      .catch(() => {}); // silent fallback
  }, []);

  const switchTemplate = (id) => {
    if (TEMPLATES[id]) {
      setTemplate(TEMPLATES[id]);
      localStorage.setItem('cms_template', id);
    }
  };

  return (
    <TemplateContext.Provider value={{ template, switchTemplate, templates: TEMPLATES }}>
      <div style={{ background: template.colors.bg, minHeight: '100vh' }}>
        <Header template={template} />
        <main>{children}</main>
        <Footer template={template} />
        <WhatsAppButton />
        {/* Template preview bar (dev mode only) */}
        {process.env.NEXT_PUBLIC_SHOW_TEMPLATE_SWITCHER === 'true' && hydrated && (
          <TemplateSwitcherBar current={template} onSwitch={switchTemplate}/>
        )}
      </div>
    </TemplateContext.Provider>
  );
}

function TemplateSwitcherBar({ current, onSwitch }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position:'fixed', bottom:80, left:16, zIndex:999 }}>
      <button onClick={()=>setOpen(!open)}
        style={{ background:'#1a1a1a', color:'#c9a84c', border:'1px solid #c9a84c', borderRadius:8, padding:'8px 14px', fontSize:12, fontWeight:600, cursor:'pointer', boxShadow:'0 4px 16px rgba(0,0,0,0.3)' }}>
        🎨 Template: {current.name}
      </button>
      {open && (
        <div style={{ position:'absolute', bottom:'calc(100% + 8px)', left:0, background:'#1a1a1a', border:'1px solid #333', borderRadius:12, padding:8, minWidth:200, boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
          {Object.values(TEMPLATES).map(t => (
            <button key={t.id} onClick={()=>{ onSwitch(t.id); setOpen(false); }}
              style={{ display:'block', width:'100%', padding:'10px 14px', textAlign:'left', background:current.id===t.id?'#2a2a2a':'transparent', border:'none', borderRadius:8, color:current.id===t.id?'#c9a84c':'#f5f0e8', fontSize:13, cursor:'pointer', marginBottom:2 }}>
              {current.id===t.id?'✓ ':''}{t.name}
              <div style={{ fontSize:11, color:'#6b6b6b', marginTop:2 }}>{t.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
