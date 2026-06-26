'use client';
import Link from 'next/link';
import { MENU_DATA } from '@/lib/menuData';

const G = 'var(--color-accent)';
const T = 'var(--color-text)';
const M = 'var(--color-text-muted)';
const B = 'var(--color-bg)';

function FilmstripPanel({ section, open }) {
  const data = MENU_DATA[section];
  if (!data) return null;

  const cards = section === 'diamonds'
    ? [
        { ...data.natural,  image: data.natural.image  },
        { ...data.labGrown, image: data.labGrown.image },
        ...(data.shapes||[]).map(s=>({ label:s.label, href:s.href, image: data.image })),
      ]
    : (data.categories || data.items || data.collections || []).map(i=>({ label:i.label,href:i.href,image:i.image||data.image }));

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
      <div style={{ maxWidth:1280,margin:'0 auto',padding:'32px 48px 32px' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24 }}>
          <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M }}>{data.label}</p>
          <Link href={data.href} style={{ fontSize:10,fontWeight:600,letterSpacing:'0.14em',textTransform:'uppercase',color:G,textDecoration:'none' }}>View All →</Link>
        </div>
        {/* Scrollable filmstrip */}
        <div style={{ display:'flex',gap:16,overflowX:'auto',paddingBottom:8,
          scrollbarWidth:'thin',scrollbarColor:`${G} transparent` }}>
          {cards.map((card,i) => (
            <Link key={i} href={card.href||'#'}
              style={{ flexShrink:0,display:'block',width:160,textDecoration:'none',position:'relative' }}
              onMouseOver={e=>{e.currentTarget.querySelector('img').style.transform='scale(1.04)';e.currentTarget.querySelector('.cl').style.color=G;}}
              onMouseOut={e=>{e.currentTarget.querySelector('img').style.transform='scale(1)';e.currentTarget.querySelector('.cl').style.color=T;}}>
              <div style={{ overflow:'hidden',background:'#f5ede2',marginBottom:8 }}>
                <img src={card.image||data.image} alt={card.label} style={{ width:160,height:200,objectFit:'cover',display:'block',transition:'transform 400ms ease' }}/>
              </div>
              <span className="cl" style={{ display:'block',fontSize:12,fontFamily:'var(--font-heading)',fontWeight:500,color:T,letterSpacing:'0.06em',transition:'color 150ms ease',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{card.label}</span>
              {card.note&&<span style={{ display:'block',fontSize:9,color:M,marginTop:2 }}>{card.note}</span>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MenuM4Filmstrip({ openMenu }) {
  const MAP = { Jewellery:'jewellery', Diamonds:'diamonds', Collections:'collections' };
  return (
    <>
      {Object.entries(MAP).map(([label,key]) => (
        <FilmstripPanel key={key} section={key} open={openMenu===label} />
      ))}
    </>
  );
}