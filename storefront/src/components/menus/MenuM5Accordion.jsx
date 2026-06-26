'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { MENU_DATA } from '@/lib/menuData';

const G = 'var(--color-accent)';
const T = 'var(--color-text)';
const M = 'var(--color-text-muted)';
const B = 'var(--color-bg)';

const SECTIONS = [
  { key:'jewellery',   label:'Jewellery'   },
  { key:'diamonds',    label:'Diamonds'    },
  { key:'collections', label:'Collections' },
  { key:'about',       label:'About'       },
];

function AccordionPanel({ open }) {
  const [expanded, setExpanded] = useState('jewellery');
  const [img, setImg] = useState(MENU_DATA.jewellery.image);

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
      <div style={{ maxWidth:1280,margin:'0 auto',padding:'0 48px',display:'grid',gridTemplateColumns:'1fr 320px',gap:48 }}>
        {/* Accordion */}
        <div style={{ padding:'32px 0' }}>
          {SECTIONS.map(sec => {
            const data = MENU_DATA[sec.key];
            const isOpen = expanded === sec.key;
            const items = sec.key==='diamonds'
              ? [data.natural,data.labGrown,...(data.shapes||[])].filter(Boolean)
              : (data.categories||data.items||data.collections||[]);

            return (
              <div key={sec.key} style={{ borderBottom:'1px solid var(--color-border)' }}>
                <button onClick={()=>setExpanded(isOpen?null:sec.key)}
                  style={{ width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 0',background:'none',border:'none',cursor:'pointer',fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,letterSpacing:'0.06em',color:isOpen?G:T,transition:'color 150ms ease' }}>
                  {sec.label}
                  <ChevronRight size={14} style={{ transform:isOpen?'rotate(90deg)':'rotate(0)',transition:'transform 200ms ease',color:M }}/>
                </button>
                <div style={{ maxHeight:isOpen?500:0,overflow:'hidden',transition:'max-height 280ms ease' }}>
                  <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'4px 24px',paddingBottom:16 }}>
                    {items.map(item => (
                      <Link key={item.label} href={item.href||'#'}
                        onMouseEnter={()=>item.image&&setImg(item.image)}
                        style={{ display:'flex',flexDirection:'column',padding:'6px 0',fontSize:12,fontFamily:'var(--font-heading)',fontWeight:500,color:T,textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                        onMouseOver={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G;}}
                        onMouseOut={e=>{e.currentTarget.style.color=T;e.currentTarget.style.borderBottomColor='transparent';}}>
                        {item.label}
                        {item.note&&<span style={{ fontSize:9,color:M,marginTop:1 }}>{item.note}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right editorial image */}
        <div style={{ position:'relative',overflow:'hidden',background:'#1a120a',alignSelf:'stretch' }}>
          <img src={img} alt="" style={{ width:'100%',height:'100%',objectFit:'cover',opacity:0.9,transition:'all 400ms ease' }}/>
          <div style={{ position:'absolute',inset:0,background:'linear-gradient(to top,rgba(0,0,0,0.6) 0%,transparent 50%)' }}/>
          <div style={{ position:'absolute',bottom:24,left:20,right:20 }}>
            <Link href="/appointment" style={{ display:'block',textAlign:'center',padding:'11px',background:G,color:'#fff',textDecoration:'none',fontSize:10,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase' }}>
              Book Private Viewing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MenuM5Accordion({ openMenu }) {
  const isOpen = ['Jewellery','Diamonds','Collections','About'].includes(openMenu);
  return <AccordionPanel open={isOpen} />;
}