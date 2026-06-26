'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { sfAPI } from '@/lib/api';
import { MENU_DATA } from '@/lib/menuData';

const G = 'var(--color-accent)';
const T = 'var(--color-text)';
const M = 'var(--color-text-muted)';
const B = 'var(--color-bg)';

function DualPanel({ section, open }) {
  const [products, setProducts] = useState([]);
  const data = MENU_DATA[section];

  useEffect(() => {
    if (!open) return;
    sfAPI.products({ limit:4, is_featured:true })
      .then(r => setProducts((r.data?.data||[]).slice(0,4)))
      .catch(()=>{});
  }, [open]);

  if (!data) return null;

  const items = section==='diamonds'
    ? [data.natural,data.labGrown,...(data.shapes||[])].filter(Boolean)
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
      <div style={{ maxWidth:1280,margin:'0 auto',padding:'40px 48px',display:'grid',gridTemplateColumns:'300px 1fr',gap:48 }}>
        {/* Left — static links */}
        <div>
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>
            {section==='diamonds'?'Browse Diamonds':'Browse {data.label}'}
          </p>
          <ul style={{ listStyle:'none',padding:0,margin:0 }}>
            {items.map(item=>(
              <li key={item.label} style={{ marginBottom:2 }}>
                <Link href={item.href||'#'}
                  style={{ display:'flex',flexDirection:'column',padding:'8px 0',fontSize:13,fontFamily:'var(--font-heading)',fontWeight:500,color:T,textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                  onMouseOver={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G;}}
                  onMouseOut={e=>{e.currentTarget.style.color=T;e.currentTarget.style.borderBottomColor='transparent';}}>
                  {item.label}
                  {item.note&&<span style={{ fontSize:9,color:M,marginTop:1 }}>{item.note}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — live products */}
        <div>
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:20,paddingBottom:10,borderBottom:'1px solid var(--color-border)' }}>Featured Pieces</p>
          {products.length > 0 ? (
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16 }}>
              {products.map(p=>{
                const isPOR = !p.final_price || Number(p.final_price)===0;
                const href = p.inventory_type==='NATURAL_DIAMOND'?`/diamonds/${p.id}`:p.inventory_type==='LAB_GROWN_DIAMOND'?`/lab-grown/${p.id}`:`/jewellery/${p.slug||p.id}`;
                return (
                  <Link key={p.id} href={href}
                    style={{ textDecoration:'none' }}
                    onMouseOver={e=>{e.currentTarget.querySelector('img')&&(e.currentTarget.querySelector('img').style.transform='scale(1.04)');}}
                    onMouseOut={e=>{e.currentTarget.querySelector('img')&&(e.currentTarget.querySelector('img').style.transform='scale(1)');}}>
                    <div style={{ overflow:'hidden',background:'#f5ede2',marginBottom:8 }}>
                      {p.thumb_url
                        ? <img src={p.thumb_url} alt={p.name} style={{ width:'100%',height:140,objectFit:'cover',display:'block',transition:'transform 400ms ease' }}/>
                        : <div style={{ width:'100%',height:140,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32 }}>💍</div>
                      }
                    </div>
                    <p style={{ fontSize:11,fontFamily:'var(--font-heading)',fontWeight:500,color:T,letterSpacing:'0.04em',marginBottom:2,lineHeight:1.3 }}>{p.name}</p>
                    <p style={{ fontSize:11,color:isPOR?G:M }}>{isPOR?'Price on Request':`${p.currency||'AED'} ${Number(p.final_price).toLocaleString()}`}</p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16 }}>
              {[1,2,3,4].map(i=>(
                <div key={i}>
                  <div style={{ background:'#f0e8dc',height:140,marginBottom:8,animation:'pulse 1.5s ease infinite' }}/>
                  <div style={{ background:'#f0e8dc',height:12,width:'70%',marginBottom:4 }}/>
                  <div style={{ background:'#f0e8dc',height:10,width:'40%' }}/>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MenuM8DualPanel({ openMenu }) {
  const MAP = { Jewellery:'jewellery', Diamonds:'diamonds', Collections:'collections' };
  return (
    <>
      {Object.entries(MAP).map(([label,key])=>(
        <DualPanel key={key} section={key} open={openMenu===label} />
      ))}
    </>
  );
}