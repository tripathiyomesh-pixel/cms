'use client';
import Link from 'next/link';
import { MENU_DATA } from '@/lib/menuData';

const G = 'var(--color-accent)';
const T = 'var(--color-text)';
const M = 'var(--color-text-muted)';
const B = 'var(--color-bg)';

function TiffanyPanel({ section, open }) {
  const data = MENU_DATA[section];
  if (!data) return null;
  const cols = section === 'jewellery'
    ? [
        { heading:'Shop by Type', items: data.categories||[] },
        { heading:'Collections',  items: data.collections||[] },
        { heading:'Quick Links',  items: MENU_DATA.about.items||[] },
        { heading:'Featured',     items: [data.featured,{label:'All Jewellery',href:'/jewellery'},{label:'New Arrivals',href:'/jewellery?is_new_arrival=true'}].filter(Boolean) },
        { heading:'Services',     items: [{label:'Book a Viewing',href:'/appointment'},{label:'Bespoke',href:'/custom'},{label:'Gift Wrapping',href:'/appointment?type=gift'},{label:'Certificate Verify',href:'/verify'}] },
      ]
    : section === 'diamonds'
    ? [
        { heading:'Diamond Type', items:[data.natural,data.labGrown].filter(Boolean) },
        { heading:'By Shape',     items: data.shapes||[] },
        { heading:'Services',     items:[{label:'Book Consultation',href:'/appointment?purpose=diamond'},{label:'Compare Diamonds',href:'/diamonds'},{label:'4Cs Guide',href:'/about'},{label:'Verify Certificate',href:'/verify'}] },
        { heading:'Collections',  items: MENU_DATA.collections.items.slice(0,5)||[] },
        { heading:'Quick Links',  items: MENU_DATA.about.items||[] },
      ]
    : [
        { heading:'Collections',  items: (data.items||[]).slice(0,5) },
        { heading:'More',         items: (data.items||[]).slice(5,9) },
        { heading:'Services',     items:[{label:'Book a Viewing',href:'/appointment'},{label:'Bespoke',href:'/custom'}] },
        { heading:'About',        items: MENU_DATA.about.items||[] },
        { heading:'New',          items:[{label:'New Arrivals',href:'/jewellery?is_new_arrival=true'}] },
      ];

  const imgCards = (data.collections||data.items||[]).slice(0,5);

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
      {/* 5-col top */}
      <div style={{ maxWidth:1280,margin:'0 auto',padding:'40px 48px 24px',display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:24 }}>
        {cols.map((col,ci) => (
          <div key={ci}>
            <p style={{ fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:M,marginBottom:16,paddingBottom:8,borderBottom:'1px solid var(--color-border)' }}>{col.heading}</p>
            <ul style={{ listStyle:'none',padding:0,margin:0 }}>
              {col.items.map(item => (
                <li key={item.label} style={{ marginBottom:2 }}>
                  <Link href={item.href||'#'}
                    style={{ display:'flex',flexDirection:'column',padding:'5px 0',fontSize:12,fontFamily:'var(--font-heading)',fontWeight:500,color:T,textDecoration:'none',letterSpacing:'0.04em',borderBottom:'1px solid transparent',transition:'all 150ms ease' }}
                    onMouseOver={e=>{e.currentTarget.style.color=G;e.currentTarget.style.borderBottomColor=G;}}
                    onMouseOut={e=>{e.currentTarget.style.color=T;e.currentTarget.style.borderBottomColor='transparent';}}>
                    {item.label}
                    {item.note&&<span style={{ fontSize:9,color:M,marginTop:1 }}>{item.note}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {/* Bottom image card strip */}
      {imgCards.length > 0 && (
        <div style={{ borderTop:'1px solid #e8ddd0',padding:'16px 48px 20px',maxWidth:1280,margin:'0 auto' }}>
          <div style={{ display:'flex',gap:12,overflowX:'auto' }}>
            {imgCards.map(item => (
              <Link key={item.label} href={item.href||'#'}
                style={{ flexShrink:0,display:'block',width:140,textDecoration:'none',position:'relative',overflow:'hidden' }}
                onMouseOver={e=>{e.currentTarget.querySelector('img').style.transform='scale(1.05)';}}
                onMouseOut={e=>{e.currentTarget.querySelector('img').style.transform='scale(1)';}}>
                <img src={item.image||data.image} alt={item.label} style={{ width:140,height:90,objectFit:'cover',display:'block',transition:'transform 400ms ease' }}/>
                <span style={{ display:'block',fontSize:10,fontFamily:'var(--font-heading)',color:T,marginTop:6,letterSpacing:'0.04em' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuM2Tiffany({ openMenu }) {
  return (
    <>
      {['jewellery','diamonds','collections'].map(s=>(
        <TiffanyPanel key={s} section={s} open={openMenu===({'jewellery':'Jewellery','diamonds':'Diamonds','collections':'Collections'})[s]} />
      ))}
    </>
  );
}