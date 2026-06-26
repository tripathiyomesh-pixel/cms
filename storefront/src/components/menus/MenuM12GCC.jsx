'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MENU_DATA } from '@/lib/menuData';

const G = 'var(--color-accent)';
const T = 'var(--color-text)';
const M = 'var(--color-text-muted)';
const B = 'var(--color-bg)';

// Arabic labels for GCC regional menu
const AR_LABELS = {
  'Jewellery':      'المجوهرات',
  'Rings':          'الخواتم',
  'Necklaces':      'القلائد',
  'Bracelets':      'الأساور',
  'Earrings':       'الأقراط',
  'Sets':           'الأطقم',
  'Bangles':        'الحلق',
  'Pendants':       'قلادات',
  'Mallika':        'ملكة',
  'Frost':          'فروست',
  'High Jewellery': 'المجوهرات الراقية',
  'Adamas':         'أداماس',
  'Farashat':       'فراشات',
  'Luluaat':        'لؤلؤات',
  'Collections':    'المجموعات',
  'About':          'عن تيجوري',
  'Diamonds':       'الماس',
  'Natural Diamonds':   'الماس الطبيعي',
  'Lab-Grown Diamonds': 'الماس المزروع',
  'Round':    'مستدير',
  'Princess': 'الأميرة',
  'Oval':     'بيضاوي',
  'Emerald':  'الزمرد',
  'Pear':     'الكمثرى',
  'Cushion':  'وسادة',
};

function GoldRateBar() {
  const [rates, setRates] = useState({ xau_aed: null, xau_usd: null });
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    fetch(`${api}/storefront/metal-rates`).then(r=>r.json()).then(d=>{
      const data = d.data||{};
      setRates({ xau_aed: data.gold_24k_aed||data.xau_aed||null, xau_usd: data.xau_usd||null });
    }).catch(()=>{});
  }, []);

  if (!rates.xau_aed) return null;
  return (
    <div style={{ background:'var(--nav-bg,#24122e)',color:'#fff',fontSize:10,letterSpacing:'0.12em',padding:'5px 48px',display:'flex',alignItems:'center',gap:24,borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
      <span style={{ color:G,fontWeight:600 }}>✦ Live Gold Rate</span>
      <span>24K AED {Number(rates.xau_aed).toLocaleString('en-AE',{minimumFractionDigits:2,maximumFractionDigits:2})}/g</span>
      {rates.xau_usd && <span>USD {Number(rates.xau_usd).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}/oz</span>}
      <span style={{ marginLeft:'auto',fontSize:9,color:'rgba(255,255,255,0.4)' }}>Updated live · Tejori Dubai</span>
    </div>
  );
}

function GCCPanel({ section, open, lang }) {
  const [img, setImg] = useState(null);
  const data = MENU_DATA[section];
  if (!data) return null;
  const isAR = lang === 'ar';

  const items = section==='diamonds'
    ? [data.natural, data.labGrown, ...(data.shapes||[])].filter(Boolean)
    : (data.categories||data.items||data.collections||[]);
  const col2 = section==='jewellery' ? data.collections||[] : [];
  const lbl = (en) => isAR ? (AR_LABELS[en]||en) : en;

  return (
    <div aria-hidden={!open} style={{
      position:'absolute',top:'100%',left:0,right:0,
      background:B,borderTop:'1px solid var(--color-border)',
      borderBottom:`3px solid ${G}`,
      boxShadow:'0 20px 60px rgba(0,0,0,0.12)',
      opacity:open?1:0,pointerEvents:open?'auto':'none',
      transform:open?'translateY(0)':'translateY(-8px)',
      transition:'opacity 200ms ease,transform 200ms ease',zIndex:100,
      direction:isAR?'rtl':'ltr',
    }}>
      <GoldRateBar/>
      <div style={{ maxWidth:1280,margin:'0 auto',padding:'40px 48px',display:'grid',gridTemplateColumns:'1fr 1fr 1fr 240px',gap:32 }}>
        {/* Col 1 */}
        <div>
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>
            {lbl(section==='diamonds'?'Diamonds':data.label)}
          </p>
          <ul style={{ listStyle:'none',padding:0,margin:0 }}>
            {items.slice(0,8).map(item=>(
              <li key={item.label} style={{ marginBottom:2 }}>
                <Link href={item.href||'#'} onMouseEnter={()=>item.image&&setImg(item.image)}
                  style={{ display:'flex',flexDirection:'column',padding:'8px 0',fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,textDecoration:'none',letterSpacing:isAR?'0':'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                  onMouseOver={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G;}}
                  onMouseOut={e=>{e.currentTarget.style.color=T;e.currentTarget.style.borderBottomColor='transparent';}}>
                  <span style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                    <span>{lbl(item.label)}</span>
                    {isAR&&<span style={{ fontSize:11,color:M }}>{item.label}</span>}
                  </span>
                  {item.note&&<span style={{ fontSize:9,color:M,marginTop:1 }}>{item.note}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 2 — collections or about */}
        <div>
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>
            {lbl(col2.length?'Collections':'About')}
          </p>
          <ul style={{ listStyle:'none',padding:0,margin:0 }}>
            {(col2.length?col2:MENU_DATA.about.items).map(item=>(
              <li key={item.label}>
                <Link href={item.href||'#'}
                  style={{ display:'block',padding:'7px 0',fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                  onMouseOver={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G;}}
                  onMouseOut={e=>{e.currentTarget.style.color=T;e.currentTarget.style.borderBottomColor='transparent';}}>
                  {lbl(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3 — services */}
        <div>
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>
            {isAR?'خدماتنا':'Our Services'}
          </p>
          <ul style={{ listStyle:'none',padding:0,margin:0 }}>
            {[
              { label:isAR?'حجز موعد':'Book an Appointment',href:'/appointment' },
              { label:isAR?'مجوهرات مخصصة':'Custom Jewellery',href:'/custom' },
              { label:isAR?'التحقق من الشهادة':'Verify Certificate',href:'/verify' },
              { label:isAR?'قصتنا':'Our Story',href:'/about' },
            ].map(item=>(
              <li key={item.label}>
                <Link href={item.href}
                  style={{ display:'block',padding:'7px 0',fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                  onMouseOver={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G;}}
                  onMouseOut={e=>{e.currentTarget.style.color=T;e.currentTarget.style.borderBottomColor='transparent';}}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Image */}
        <div style={{ overflow:'hidden',background:'#f5ede2' }}>
          <img src={img||data.image} alt="" style={{ width:'100%',height:220,objectFit:'cover',display:'block',transition:'all 400ms ease' }}/>
        </div>
      </div>
    </div>
  );
}

export default function MenuM12GCC({ openMenu, lang = 'en', onLangToggle }) {
  const MAP = { Jewellery:'jewellery', Diamonds:'diamonds', Collections:'collections' };
  return (
    <>
      {Object.entries(MAP).map(([label,key])=>(
        <GCCPanel key={key} section={key} open={openMenu===label} lang={lang} />
      ))}
    </>
  );
}