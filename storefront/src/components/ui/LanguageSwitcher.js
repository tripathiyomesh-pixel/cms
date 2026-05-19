'use client';
import { useState, useEffect } from 'react';

const LANGUAGES = [
  { code:'en', label:'EN', dir:'ltr', flag:'🇬🇧' },
  { code:'ar', label:'عر', dir:'rtl', flag:'🇦🇪' },
];

export default function LanguageSwitcher() {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('jcos_lang') || 'en';
    setLang(saved);
    applyLang(saved);
  }, []);

  const applyLang = (code) => {
    const l = LANGUAGES.find(l=>l.code===code) || LANGUAGES[0];
    document.documentElement.setAttribute('dir', l.dir);
    document.documentElement.setAttribute('lang', l.code);
    // Update font based on dir
    document.documentElement.style.setProperty(
      '--font-body',
      l.dir === 'rtl'
        ? "'Noto Kufi Arabic', 'Inter', system-ui, sans-serif"
        : "'Inter', system-ui, sans-serif"
    );
    document.documentElement.style.setProperty(
      '--font-heading',
      l.dir === 'rtl'
        ? "'Noto Naskh Arabic', 'Cormorant Garamond', Georgia, serif"
        : "'Cormorant Garamond', Georgia, serif"
    );
  };

  const switchLang = (code) => {
    setLang(code);
    localStorage.setItem('jcos_lang', code);
    applyLang(code);
  };

  return (
    <div style={{ display:'flex', alignItems:'center', gap:2 }}>
      {LANGUAGES.map(l => (
        <button
          key={l.code}
          onClick={() => switchLang(l.code)}
          title={l.code === 'ar' ? 'العربية' : 'English'}
          style={{
            padding:'4px 8px',
            fontSize:11,
            fontWeight: lang===l.code ? 700 : 400,
            color: lang===l.code ? '#b8860b' : '#6b6b6b',
            background:'transparent',
            border:'none',
            cursor:'pointer',
            borderBottom: lang===l.code ? '1.5px solid #b8860b' : '1.5px solid transparent',
            transition:'all .15s',
            letterSpacing:'0.03em',
          }}>
          {l.label}
        </button>
      ))}
    </div>
  );
}
