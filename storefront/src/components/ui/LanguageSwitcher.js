'use client';
import { useState, useEffect } from 'react';

export default function LanguageSwitcher({ className='' }) {
  const [lang, setLang] = useState('en');
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    const saved = localStorage.getItem('lang') || 'en';
    setLang(saved);
    document.documentElement.lang = saved;
    document.documentElement.dir  = saved==='ar' ? 'rtl' : 'ltr';
  },[]);

  const changeLang = (l) => {
    setLang(l);
    setOpen(false);
    localStorage.setItem('lang', l);
    document.documentElement.lang = l;
    document.documentElement.dir  = l==='ar' ? 'rtl' : 'ltr';
    // Reload to re-apply RTL styles fully
    window.location.reload();
  };

  const LANGS = [
    { code:'en', label:'English', flag:'🇬🇧' },
    { code:'ar', label:'العربية', flag:'🇦🇪' },
  ];

  return (
    <div className={`relative ${className}`}>
      <button onClick={()=>setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-ink-200 hover:border-gold-400 transition-colors bg-white text-ink-600">
        <span>{LANGS.find(l=>l.code===lang)?.flag}</span>
        <span className="font-medium">{lang==='ar'?'عربي':'EN'}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={()=>setOpen(false)}/>
          <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-xl shadow-xl border border-ink-100 py-1 min-w-[140px]">
            {LANGS.map(l=>(
              <button key={l.code} onClick={()=>changeLang(l.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${lang===l.code?'bg-gold-50 text-gold-700':'text-ink-600 hover:bg-ink-50'}`}>
                <span>{l.flag}</span>
                <span className="font-medium">{l.label}</span>
                {lang===l.code && <svg className="ml-auto" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/></svg>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
