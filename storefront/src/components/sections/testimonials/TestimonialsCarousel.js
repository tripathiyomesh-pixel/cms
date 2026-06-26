'use client';
import { useState } from 'react';
const REVIEWS = [
  { name:'Saitama One',   title:'Fabulous Grounds',                text:'An extraordinary experience from the moment we walked in. The craftsmanship is beyond compare.' },
  { name:'Sara Colinton', title:'Great vineyard tour and tasting!', text:'The attention to detail in every piece is remarkable. We found our perfect engagement ring and it exceeded all expectations.' },
  { name:'Shetty Jamie',  title:'Stunning Design',                 text:'TEJORI has redefined luxury for us. Every visit feels like stepping into a world of elegance and precision.' },
];
export default function TestimonialsCarousel({ config={} }) {
  const [idx, setIdx] = useState(0);
  const r = REVIEWS[idx];
  const bg = config.testimonials_bg || 'var(--color-bg)';
  return (
    <section style={{ padding:'80px 60px', background:bg, textAlign:'center' }}>
      <p style={{ fontSize:10,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--color-accent)',marginBottom:40 }}>
        {config.testimonials_label||'What Our Clients Say'}
      </p>
      <div style={{ color:'var(--color-accent)',fontSize:20,letterSpacing:4,marginBottom:24 }}>★★★★★</div>
      <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,fontStyle:'italic',color:'var(--color-text)',maxWidth:700,margin:'0 auto 32px',lineHeight:1.6 }}>"{r.text}"</p>
      <p style={{ fontSize:13,fontWeight:600,color:'var(--color-text)',letterSpacing:'0.08em',marginBottom:4 }}>{r.name}</p>
      <p style={{ fontSize:12,color:'var(--color-accent)',marginBottom:32 }}>"{r.title}"</p>
      <div style={{ display:'flex',justifyContent:'center',gap:8 }}>
        {REVIEWS.map((_,i)=>(
          <button key={i} onClick={()=>setIdx(i)}
            style={{ height:2,width:i===idx?32:12,background:i===idx?'var(--color-text)':'#d4b896',border:'none',cursor:'pointer',transition:'all .3s' }}/>
        ))}
      </div>
    </section>
  );
}
