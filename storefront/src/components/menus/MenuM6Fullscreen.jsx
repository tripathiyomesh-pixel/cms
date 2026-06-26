'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { MENU_DATA } from '@/lib/menuData';

const G = 'var(--color-accent)';
const M = 'var(--color-text-muted)';

const SECTIONS = [
  { key:'jewellery',   label:'Jewellery'   },
  { key:'diamonds',    label:'Diamonds'    },
  { key:'collections', label:'Collections' },
  { key:'about',       label:'About'       },
];

export default function MenuM6Fullscreen({ openMenu, onClose }) {
  const open = ['Jewellery','Diamonds','Collections','About'].includes(openMenu);
  const [activeSection, setActiveSection] = useState('jewellery');
  const [img, setImg] = useState(MENU_DATA.jewellery.image);

  useEffect(() => {
    if (!open) return;
    const key = openMenu?.toLowerCase();
    if (MENU_DATA[key]) { setActiveSection(key); setImg(MENU_DATA[key].image); }
  }, [open, openMenu]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const data = MENU_DATA[activeSection] || MENU_DATA.jewellery;
  const items = activeSection==='diamonds'
    ? [data.natural,data.labGrown,...(data.shapes||[])].filter(Boolean)
    : (data.categories||data.items||data.collections||[]);

  return (
    <>
      {/* Dark backdrop */}
      <div onClick={onClose} style={{
        position:'fixed',inset:0,background:'rgba(0,0,0,0.92)',
        zIndex:998,
        opacity:open?1:0,pointerEvents:open?'auto':'none',
        transition:'opacity 300ms ease',
      }}/>
      {/* Fullscreen panel */}
      <div style={{
        position:'fixed',inset:0,zIndex:999,
        display:'flex',flexDirection:'column',
        opacity:open?1:0,pointerEvents:open?'auto':'none',
        transform:open?'translateY(0)':'translateY(-24px)',
        transition:'opacity 300ms ease,transform 300ms ease',
      }}>
        {/* Top bar */}
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'24px 48px',borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" style={{ fontFamily:'var(--font-heading)',fontSize:26,fontWeight:400,letterSpacing:'0.18em',color:'#fff',textDecoration:'none',textTransform:'uppercase' }}>
            Tejori
          </Link>
          <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',padding:8,color:'rgba(255,255,255,0.6)',transition:'color 150ms ease' }}
            onMouseOver={e=>e.currentTarget.style.color='#fff'} onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.6)'}>
            <X size={22}/>
          </button>
        </div>

        {/* Content */}
        <div style={{ flex:1,display:'grid',gridTemplateColumns:'280px 1fr 1fr',overflow:'hidden' }}>
          {/* Section switcher */}
          <div style={{ borderRight:'1px solid rgba(255,255,255,0.08)',padding:'48px 0',display:'flex',flexDirection:'column' }}>
            {SECTIONS.map(sec => (
              <button key={sec.key} onClick={()=>{ setActiveSection(sec.key); setImg(MENU_DATA[sec.key].image); }}
                style={{ padding:'14px 48px',textAlign:'left',background:'none',border:'none',cursor:'pointer',fontSize:20,fontFamily:'var(--font-heading)',fontWeight:300,letterSpacing:'0.08em',
                  color:activeSection===sec.key?G:'rgba(255,255,255,0.4)',
                  borderLeft:activeSection===sec.key?`2px solid ${G}`:'2px solid transparent',
                  transition:'all 150ms ease',
                }}
                onMouseOver={e=>{ if(activeSection!==sec.key) e.currentTarget.style.color='rgba(255,255,255,0.8)'; }}
                onMouseOut={e=>{ if(activeSection!==sec.key) e.currentTarget.style.color='rgba(255,255,255,0.4)'; }}>
                {sec.label}
              </button>
            ))}
            <div style={{ marginTop:'auto',padding:'0 48px 40px' }}>
              <Link href="/appointment" onClick={onClose}
                style={{ display:'block',textAlign:'center',padding:'13px',background:G,color:'#fff',textDecoration:'none',fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase' }}>
                Book a Viewing
              </Link>
            </div>
          </div>

          {/* Items grid */}
          <div style={{ padding:'48px',overflowY:'auto',display:'grid',gridTemplateColumns:'1fr 1fr',alignContent:'start',gap:'4px 32px' }}>
            <p style={{ gridColumn:'span 2',fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:'rgba(255,255,255,0.3)',marginBottom:20,paddingBottom:12,borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
              {activeSection==='diamonds'?'Diamond Type / Shape':'Browse'}
            </p>
            {items.map(item => (
              <Link key={item.label} href={item.href||'#'} onClick={onClose}
                onMouseEnter={()=>item.image&&setImg(item.image)}
                style={{ display:'flex',flexDirection:'column',padding:'10px 0',fontSize:15,fontFamily:'var(--font-heading)',fontWeight:300,color:'rgba(255,255,255,0.7)',textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                onMouseOver={e=>{e.currentTarget.style.color='#fff';e.currentTarget.style.borderBottomColor=G;}}
                onMouseOut={e=>{e.currentTarget.style.color='rgba(255,255,255,0.7)';e.currentTarget.style.borderBottomColor='transparent';}}>
                {item.label}
                {item.note&&<span style={{ fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:2 }}>{item.note}</span>}
              </Link>
            ))}
          </div>

          {/* Right editorial image */}
          <div style={{ position:'relative',overflow:'hidden' }}>
            <img src={img} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',opacity:0.6,transition:'all 500ms ease' }}/>
            <div style={{ position:'absolute',inset:0,background:'linear-gradient(to left,transparent 30%,rgba(0,0,0,0.7) 100%)' }}/>
          </div>
        </div>
      </div>
    </>
  );
}