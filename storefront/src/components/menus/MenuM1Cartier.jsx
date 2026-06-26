'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { MENU_DATA, NAV_ITEMS } from '@/lib/menuData';

const G = 'var(--color-accent)';
const T = 'var(--color-text)';
const M = 'var(--color-text-muted)';
const B = 'var(--color-bg)';

function Panel({ section, open }) {
  const [img, setImg] = useState(null);
  const data = MENU_DATA[section];
  useEffect(() => { if (!open) setImg(null); }, [open]);
  if (!data) return null;

  return (
    <div aria-hidden={!open} style={{
      position:'absolute', top:'100%', left:0, right:0,
      background:B, borderTop:'1px solid var(--color-border)',
      borderBottom:`3px solid ${G}`,
      boxShadow:'0 20px 60px rgba(0,0,0,0.12)',
      opacity:open?1:0, pointerEvents:open?'auto':'none',
      transform:open?'translateY(0)':'translateY(-8px)',
      transition:'opacity 200ms ease,transform 200ms ease', zIndex:100,
    }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'48px 48px 0',
        display:'grid', gridTemplateColumns:'1fr 1fr 1fr 280px', gap:40 }}>
        {/* Col 1 — categories */}
        {(data.categories||data.items||[]).length > 0 && (
          <div>
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>
              {data.label === 'Diamonds' ? 'Diamond Type' : 'Shop by Type'}
            </p>
            <ul style={{ listStyle:'none',padding:0,margin:0 }}>
              {section === 'diamonds' ? (
                <>
                  {[data.natural, data.labGrown].map(item => (
                    <li key={item.label} style={{ marginBottom:4 }}>
                      <Link href={item.href} onMouseEnter={()=>setImg(item.image)}
                        style={{ display:'flex',flexDirection:'column',padding:'8px 0',textDecoration:'none',borderBottom:'1px solid transparent',transition:'border-color 150ms ease' }}
                        onMouseOver={e=>{e.currentTarget.style.borderBottomColor=G;e.currentTarget.querySelector('.lbl').style.color=G;}}
                        onMouseOut={e=>{e.currentTarget.style.borderBottomColor='transparent';e.currentTarget.querySelector('.lbl').style.color=T;}}>
                        <span className="lbl" style={{ fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,letterSpacing:'0.04em',transition:'color 150ms ease' }}>{item.label}</span>
                        <span style={{ fontSize:10,color:M,marginTop:1 }}>{item.note}</span>
                      </Link>
                    </li>
                  ))}
                </>
              ) : (data.categories||data.items||[]).map(item => (
                <li key={item.label} style={{ marginBottom:4 }}>
                  <Link href={item.href} onMouseEnter={()=>item.image&&setImg(item.image)}
                    style={{ display:'block',padding:'7px 0',fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                    onMouseOver={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G;}}
                    onMouseOut={e=>{e.currentTarget.style.color=T;e.currentTarget.style.borderBottomColor='transparent';}}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Col 2 — collections or shapes */}
        <div>
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>
            {section==='diamonds'?'By Shape':'Collections'}
          </p>
          <ul style={{ listStyle:'none',padding:0,margin:0 }}>
            {(section==='diamonds'?data.shapes:data.collections||[]).map(item => (
              <li key={item.label} style={{ marginBottom:4 }}>
                <Link href={item.href} onMouseEnter={()=>item.image&&setImg(item.image)}
                  style={{ display:'block',padding:'7px 0',fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                  onMouseOver={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G;}}
                  onMouseOut={e=>{e.currentTarget.style.color=T;e.currentTarget.style.borderBottomColor='transparent';}}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Col 3 — about or extra */}
        <div>
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>Quick Links</p>
          <ul style={{ listStyle:'none',padding:0,margin:0 }}>
            {(MENU_DATA.about.items||[]).map(item => (
              <li key={item.label} style={{ marginBottom:4 }}>
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
        {/* Image panel */}
        <div style={{ position:'relative',width:280,height:320,overflow:'hidden',background:'#f5ede2',flexShrink:0 }}>
          <img src={img||data.image} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',transition:'opacity 300ms ease,transform 400ms ease' }}/>
        </div>
      </div>
      <div style={{ maxWidth:1280,margin:'0 auto',padding:'16px 48px 20px',borderTop:'1px solid #e8ddd0',marginTop:32 }}>
        <Link href={data.href} style={{ fontSize:11,fontWeight:600,letterSpacing:'0.18em',textTransform:'uppercase',color:G,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8 }}>
          ✦ Explore All {data.label}
        </Link>
      </div>
    </div>
  );
}

export default function MenuM1Cartier({ openMenu, onEnter, onLeave }) {
  return (
    <>
      {NAV_ITEMS.filter(n=>n.key).map(n => (
        <Panel key={n.key} section={n.key} open={openMenu===n.label} />
      ))}
    </>
  );
}