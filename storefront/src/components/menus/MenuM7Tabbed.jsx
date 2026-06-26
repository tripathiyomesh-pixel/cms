'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MENU_DATA } from '@/lib/menuData';

const G = 'var(--color-accent)';
const T = 'var(--color-text)';
const M = 'var(--color-text-muted)';
const B = 'var(--color-bg)';

const TABS = [
  { key:'jewellery',   label:'Jewellery'   },
  { key:'diamonds',    label:'Diamonds'    },
  { key:'collections', label:'Collections' },
];

function TabbedPanel({ section, open }) {
  const [tab, setTab] = useState(TABS[0].key);
  const data = MENU_DATA[tab];
  const items = tab==='diamonds'
    ? [data.natural,data.labGrown,...(data.shapes||[])].filter(Boolean)
    : (data.categories||data.items||data.collections||[]);
  const col2 = tab==='diamonds' ? [] : (data.collections||[]);

  return (
    <div aria-hidden={!open} style={{
      position:'absolute',top:'100%',left:0,right:0,
      background:B,borderTop:'1px solid var(--color-border)',
      borderBottom:`3px solid ${G}`,
      boxShadow:'0 20px 60px rgba(0,0,0,0.12)',
      opacity:open?1:0,pointerEvents:open?'auto':'none',
      transform:open?'translateY(0)':'translateY(-8px)',
      transition:'opacity 200ms ease,transform 200ms ease',zIndex:100,
    }}>
      {/* Tab bar */}
      <div style={{ borderBottom:'1px solid var(--color-border)',padding:'0 48px',display:'flex',gap:0 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{ padding:'16px 24px',border:'none',background:'none',cursor:'pointer',fontSize:11,fontWeight:tab===t.key?700:500,letterSpacing:'0.12em',textTransform:'uppercase',color:tab===t.key?G:M,borderBottom:tab===t.key?`2px solid ${G}`:'2px solid transparent',marginBottom:-1,transition:'all 150ms ease' }}>
            {t.label}
          </button>
        ))}
      </div>
      {/* Content */}
      <div style={{ maxWidth:1280,margin:'0 auto',padding:'40px 48px',display:'grid',gridTemplateColumns:'1fr 1fr 280px',gap:40 }}>
        <div>
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>
            {tab==='diamonds'?'Diamond Type & Shape':'Shop by Type'}
          </p>
          <ul style={{ listStyle:'none',padding:0,margin:0 }}>
            {items.map(item=>(
              <li key={item.label} style={{ marginBottom:2 }}>
                <Link href={item.href||'#'}
                  style={{ display:'flex',flexDirection:'column',padding:'7px 0',fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                  onMouseOver={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G;}}
                  onMouseOut={e=>{e.currentTarget.style.color=T;e.currentTarget.style.borderBottomColor='transparent';}}>
                  {item.label}
                  {item.note&&<span style={{ fontSize:10,color:M,marginTop:1 }}>{item.note}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {col2.length > 0 ? (
          <div>
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>Collections</p>
            <ul style={{ listStyle:'none',padding:0,margin:0 }}>
              {col2.map(item=>(
                <li key={item.label} style={{ marginBottom:2 }}>
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
        ) : (
          <div>
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>Quick Links</p>
            <ul style={{ listStyle:'none',padding:0,margin:0 }}>
              {MENU_DATA.about.items.map(item=>(
                <li key={item.label}>
                  <Link href={item.href} style={{ display:'block',padding:'7px 0',fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                    onMouseOver={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G;}}
                    onMouseOut={e=>{e.currentTarget.style.color=T;e.currentTarget.style.borderBottomColor='transparent';}}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div style={{ position:'relative',overflow:'hidden',background:'#f5ede2' }}>
          <img src={data.image} alt="" style={{ width:'100%',height:280,objectFit:'cover',transition:'all 400ms ease' }}/>
          <div style={{ padding:'12px 0' }}>
            <Link href={data.href||'/'} style={{ fontSize:11,fontWeight:600,letterSpacing:'0.16em',textTransform:'uppercase',color:G,textDecoration:'none' }}>
              Explore All →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MenuM7Tabbed({ openMenu }) {
  const isOpen = ['Jewellery','Diamonds','Collections'].includes(openMenu);
  return <TabbedPanel section={openMenu?.toLowerCase()||'jewellery'} open={isOpen} />;
}