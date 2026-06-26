'use client';
import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { MENU_DATA, NAV_ITEMS } from '@/lib/menuData';

const G = 'var(--color-accent)';
const T = 'var(--color-text)';
const M = 'var(--color-text-muted)';
const B = 'var(--color-bg)';

// Tooltip card that floats near the nav item
export default function MenuM10Tooltip({ openMenu, navRef }) {
  const section = openMenu
    ? (openMenu==='Jewellery'?'jewellery':openMenu==='Diamonds'?'diamonds':openMenu==='Collections'?'collections':openMenu==='About'?'about':null)
    : null;
  const data = section ? MENU_DATA[section] : null;
  const isOpen = !!data;

  const items = !data ? [] : section==='diamonds'
    ? [data.natural, data.labGrown, ...(data.shapes||[]).slice(0,4)].filter(Boolean)
    : (data.categories||data.items||data.collections||[]).slice(0,8);

  return (
    <div aria-hidden={!isOpen} style={{
      position:'absolute',top:'100%',left:0,right:0,
      zIndex:100,
      opacity:isOpen?1:0,pointerEvents:isOpen?'auto':'none',
      transition:'opacity 150ms ease',
    }}>
      {isOpen && (
        <div style={{
          position:'absolute',
          top:8,
          left:'50%',
          transform:'translateX(-50%)',
          width:320,
          background:B,
          border:`1px solid var(--color-border)`,
          borderTop:`3px solid ${G}`,
          boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
          padding:'24px 24px 16px',
        }}>
          {/* Arrow */}
          <div style={{ position:'absolute',top:-7,left:'50%',transform:'translateX(-50%)',width:12,height:12,background:G,clipPath:'polygon(50% 0%,0% 100%,100% 100%)' }}/>

          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:16,paddingBottom:8,borderBottom:'1px solid var(--color-border)' }}>
            {data.label}
          </p>

          {/* Image */}
          <div style={{ marginBottom:16,overflow:'hidden' }}>
            <img src={data.image} alt={data.label} style={{ width:'100%',height:120,objectFit:'cover',display:'block' }}/>
          </div>

          {/* Items */}
          <ul style={{ listStyle:'none',padding:0,margin:0 }}>
            {items.map(item=>(
              <li key={item.label}>
                <Link href={item.href||'#'}
                  style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 0',fontSize:12,fontFamily:'var(--font-heading)',fontWeight:500,color:T,textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                  onMouseOver={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G;}}
                  onMouseOut={e=>{e.currentTarget.style.color=T;e.currentTarget.style.borderBottomColor='transparent';}}>
                  <span>{item.label}</span>
                  {item.note&&<span style={{ fontSize:9,color:M }}>{item.note}</span>}
                </Link>
              </li>
            ))}
          </ul>

          <div style={{ marginTop:16,paddingTop:12,borderTop:'1px solid var(--color-border)' }}>
            <Link href={data.href||'/'} style={{ fontSize:10,fontWeight:600,letterSpacing:'0.14em',textTransform:'uppercase',color:G,textDecoration:'none' }}>
              View All {data.label} →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}