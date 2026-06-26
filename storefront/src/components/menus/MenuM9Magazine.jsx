'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MENU_DATA } from '@/lib/menuData';

const G = 'var(--color-accent)';
const T = 'var(--color-text)';
const M = 'var(--color-text-muted)';
const B = 'var(--color-bg)';

function MagazinePanel({ section, open }) {
  const [img, setImg] = useState(null);
  const data = MENU_DATA[section];
  if (!data) return null;

  const items = section==='diamonds'
    ? [data.natural, data.labGrown, ...(data.shapes||[])].filter(Boolean)
    : (data.categories||data.items||data.collections||[]);

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
      <div style={{ maxWidth:1280,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 400px',minHeight:360 }}>
        {/* Left — editorial big hero */}
        <div style={{ position:'relative',overflow:'hidden',background:'#1a120a' }}>
          <img src={img||data.image} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',opacity:0.75,transition:'all 500ms ease',position:'absolute',inset:0 }}/>
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(to right,rgba(0,0,0,0.6) 0%,transparent 80%)' }}/>
          <div style={{ position:'relative',padding:'48px 40px',height:'100%',display:'flex',flexDirection:'column',justifyContent:'flex-end' }}>
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.3em',textTransform:'uppercase',color:G,marginBottom:10 }}>Tejori</p>
            <h3 style={{ fontFamily:'var(--font-heading)',fontSize:'clamp(1.6rem,3vw,2.4rem)',fontWeight:300,color:'#fff',letterSpacing:'0.08em',marginBottom:16,lineHeight:1.2 }}>
              {data.label}
            </h3>
            <p style={{ fontSize:12,color:'rgba(255,255,255,0.6)',lineHeight:1.7,maxWidth:320,marginBottom:24 }}>
              {section==='diamonds'
                ? 'Certified, conflict-free diamonds. Every stone graded by GIA or IGI for your confidence.'
                : section==='collections'
                ? 'Each collection tells a story — from intimate heirlooms to statement high jewellery.'
                : 'Handcrafted in gold and platinum, each piece a quiet expression of enduring beauty.'}
            </p>
            <Link href={data.href} style={{ fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:G,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8 }}>
              Explore All {data.label} →
            </Link>
          </div>
        </div>

        {/* Right — link list */}
        <div style={{ padding:'40px 32px',borderLeft:'1px solid var(--color-border)' }}>
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>
            {section==='diamonds'?'Browse':'Discover'}
          </p>
          <ul style={{ listStyle:'none',padding:0,margin:0 }}>
            {items.map(item=>(
              <li key={item.label} style={{ marginBottom:2 }}>
                <Link href={item.href||'#'} onMouseEnter={()=>item.image&&setImg(item.image)}
                  style={{ display:'flex',flexDirection:'column',padding:'9px 0',fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                  onMouseOver={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G;}}
                  onMouseOut={e=>{e.currentTarget.style.color=T;e.currentTarget.style.borderBottomColor='transparent';}}>
                  {item.label}
                  {item.note&&<span style={{ fontSize:9,color:M,marginTop:1 }}>{item.note}</span>}
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ marginTop:24,paddingTop:20,borderTop:'1px solid var(--color-border)' }}>
            <Link href="/appointment" style={{ fontSize:10,fontWeight:600,letterSpacing:'0.14em',textTransform:'uppercase',color:G,textDecoration:'none' }}>
              ✦ Book a Private Viewing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MenuM9Magazine({ openMenu }) {
  const MAP = { Jewellery:'jewellery', Diamonds:'diamonds', Collections:'collections' };
  return (
    <>
      {Object.entries(MAP).map(([label,key])=>(
        <MagazinePanel key={key} section={key} open={openMenu===label} />
      ))}
    </>
  );
}