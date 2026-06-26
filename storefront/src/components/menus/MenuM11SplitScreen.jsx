'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { MENU_DATA } from '@/lib/menuData';

const G = 'var(--color-accent)';
const T = 'var(--color-text)';
const M = 'var(--color-text-muted)';

const SECTIONS = [
  { key:'jewellery',   label:'Jewellery'   },
  { key:'diamonds',    label:'Diamonds'    },
  { key:'collections', label:'Collections' },
  { key:'about',       label:'About'       },
];

export default function MenuM11SplitScreen({ openMenu, onClose }) {
  const open = ['Jewellery','Diamonds','Collections','About'].includes(openMenu);
  const [section, setSection] = useState('jewellery');
  const [img, setImg] = useState(MENU_DATA.jewellery.image);

  useEffect(() => {
    if (!open) return;
    const k = openMenu?.toLowerCase();
    if (MENU_DATA[k]) { setSection(k); setImg(MENU_DATA[k].image); }
  }, [open, openMenu]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return ()=>{document.body.style.overflow='';};
  }, [open]);

  const data = MENU_DATA[section] || MENU_DATA.jewellery;
  const items = section==='diamonds'
    ? [data.natural,data.labGrown,...(data.shapes||[])].filter(Boolean)
    : (data.categories||data.items||data.collections||[]);

  return (
    <>
      <div onClick={onClose} style={{
        position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:998,
        opacity:open?1:0,pointerEvents:open?'auto':'none',
        transition:'opacity 300ms ease',
      }}/>
      <div style={{
        position:'fixed',top:0,left:0,right:0,height:'100vh',
        zIndex:999,display:'grid',gridTemplateColumns:'1fr 1fr',
        transform:open?'translateY(0)':'translateY(-100%)',
        transition:'transform 350ms cubic-bezier(0.4,0,0.2,1)',
        pointerEvents:open?'auto':'none',
      }}>
        {/* Left — dark list */}
        <div style={{ background:'#0f0b07',display:'flex',flexDirection:'column',overflowY:'auto' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'28px 48px',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <Link href="/" onClick={onClose} style={{ fontFamily:'var(--font-heading)',fontSize:24,fontWeight:400,letterSpacing:'0.18em',color:'#fff',textDecoration:'none',textTransform:'uppercase' }}>Tejori</Link>
            <button onClick={onClose} style={{ background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.5)',padding:8 }}>
              <X size={20}/>
            </button>
          </div>

          {/* Section tabs */}
          <div style={{ display:'flex',borderBottom:'1px solid rgba(255,255,255,0.06)',padding:'0 48px' }}>
            {SECTIONS.map(s=>(
              <button key={s.key} onClick={()=>{setSection(s.key);setImg(MENU_DATA[s.key].image);}}
                style={{ padding:'14px 16px',border:'none',background:'none',cursor:'pointer',fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',
                  color:section===s.key?G:'rgba(255,255,255,0.35)',
                  borderBottom:section===s.key?`2px solid ${G}`:'2px solid transparent',
                  marginBottom:-1,transition:'all 150ms ease',
                }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Items */}
          <nav style={{ flex:1,padding:'32px 48px',display:'flex',flexDirection:'column',gap:2 }}>
            {items.map(item=>(
              <Link key={item.label} href={item.href||'#'} onClick={onClose}
                onMouseEnter={()=>item.image&&setImg(item.image)}
                style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',fontSize:15,fontFamily:'var(--font-heading)',fontWeight:300,color:'rgba(255,255,255,0.65)',textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'all 150ms ease' }}
                onMouseOver={e=>{e.currentTarget.style.color='#fff';e.currentTarget.style.paddingLeft='8px';}}
                onMouseOut={e=>{e.currentTarget.style.color='rgba(255,255,255,0.65)';e.currentTarget.style.paddingLeft='0';}}>
                <span>{item.label}</span>
                {item.note&&<span style={{ fontSize:9,color:'rgba(255,255,255,0.35)',letterSpacing:'0.1em',textTransform:'uppercase' }}>{item.note}</span>}
              </Link>
            ))}
          </nav>

          <div style={{ padding:'24px 48px',borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <Link href="/appointment" onClick={onClose}
              style={{ display:'block',textAlign:'center',padding:'14px',background:G,color:'#fff',textDecoration:'none',fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase' }}>
              Book a Private Viewing
            </Link>
          </div>
        </div>

        {/* Right — full image */}
        <div style={{ position:'relative',overflow:'hidden' }}>
          <img src={img} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',transition:'all 600ms ease' }}/>
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(to left,transparent 40%,rgba(0,0,0,0.3) 100%)' }}/>
          <div style={{ position:'absolute',bottom:48,right:48 }}>
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.3em',textTransform:'uppercase',color:G,marginBottom:8 }}>Tejori</p>
            <p style={{ fontFamily:'var(--font-heading)',fontSize:24,fontWeight:300,color:'#fff',letterSpacing:'0.08em' }}>{data.label}</p>
          </div>
        </div>
      </div>
    </>
  );
}