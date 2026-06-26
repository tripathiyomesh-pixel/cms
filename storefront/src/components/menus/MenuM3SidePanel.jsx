'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MENU_DATA } from '@/lib/menuData';

const G = 'var(--color-accent)';
const T = 'var(--color-text)';
const M = 'var(--color-text-muted)';
const B = 'var(--color-bg)';

function SidePanelMenu({ section, open }) {
  const [img, setImg] = useState(null);
  const data = MENU_DATA[section];
  if (!data) return null;

  const col1 = section === 'diamonds'
    ? [data.natural, data.labGrown].filter(Boolean)
    : (data.categories||data.items||[]);
  const col2 = section === 'diamonds' ? data.shapes||[] : (data.collections||[]);

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
      <div style={{ maxWidth:1280,margin:'0 auto',display:'grid',gridTemplateColumns:'340px 1fr 1fr',minHeight:360 }}>
        {/* Left tall image panel */}
        <div style={{ position:'relative',overflow:'hidden',background:'#1a120a' }}>
          <img src={img||data.image} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',opacity:0.85,transition:'all 400ms ease',position:'absolute',inset:0 }}/>
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.7) 0%,transparent 60%)' }}/>
          <div style={{ position:'absolute',bottom:32,left:28 }}>
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.3em',textTransform:'uppercase',color:G,marginBottom:8 }}>Tejori</p>
            <p style={{ fontFamily:'var(--font-heading)',fontSize:22,color:'#fff',fontWeight:400,letterSpacing:'0.08em' }}>{data.label}</p>
          </div>
        </div>

        {/* Col 1 */}
        <div style={{ padding:'40px 32px' }}>
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>
            {section==='diamonds'?'Diamond Type':'Shop by Type'}
          </p>
          <ul style={{ listStyle:'none',padding:0,margin:0 }}>
            {col1.map(item => (
              <li key={item.label} style={{ marginBottom:2 }}>
                <Link href={item.href} onMouseEnter={()=>item.image&&setImg(item.image)}
                  style={{ display:'flex',flexDirection:'column',padding:'8px 0',textDecoration:'none',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                  onMouseOver={e=>{e.currentTarget.style.borderBottomColor=G;e.currentTarget.querySelector('.ml').style.color=G;}}
                  onMouseOut={e=>{e.currentTarget.style.borderBottomColor='transparent';e.currentTarget.querySelector('.ml').style.color=T;}}>
                  <span className="ml" style={{ fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,letterSpacing:'0.04em',transition:'color 150ms ease' }}>{item.label}</span>
                  {item.note&&<span style={{ fontSize:10,color:M,marginTop:1 }}>{item.note}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 2 */}
        <div style={{ padding:'40px 32px' }}>
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>
            {section==='diamonds'?'By Shape':'Collections'}
          </p>
          <ul style={{ listStyle:'none',padding:0,margin:0 }}>
            {col2.map(item => (
              <li key={item.label} style={{ marginBottom:2 }}>
                <Link href={item.href} onMouseEnter={()=>item.image&&setImg(item.image)}
                  style={{ display:'block',padding:'8px 0',fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                  onMouseOver={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G;}}
                  onMouseOut={e=>{e.currentTarget.style.color=T;e.currentTarget.style.borderBottomColor='transparent';}}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ marginTop:24 }}>
            <Link href={data.href} style={{ fontSize:11,fontWeight:600,letterSpacing:'0.16em',textTransform:'uppercase',color:G,textDecoration:'none' }}>
              View All {data.label} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MenuM3SidePanel({ openMenu }) {
  const MAP = { Jewellery:'jewellery', Diamonds:'diamonds', Collections:'collections' };
  return (
    <>
      {Object.entries(MAP).map(([label, key]) => (
        <SidePanelMenu key={key} section={key} open={openMenu===label} />
      ))}
    </>
  );
}