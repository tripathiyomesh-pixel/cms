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
  const bg = config.testimonials_bg || '#fdf8f3';
  return (
    <section style={{ padding:'80px 60px', background:bg, textAlign:'center' }}>
      <p style={{ fontSize:10,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'#b8860b',marginBottom:40 }}>
        {config.testimonials_label||'What Our Clients Say'}
      </p>
      <div style={{ color:'#b8860b',fontSize:20,letterSpacing:4,marginBottom:24 }}>★★★★★</div>
      <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:26,fontWeight:300,fontStyle:'italic',color:'#1a1a1a',maxWidth:700,margin:'0 auto 32px',lineHeight:1.6 }}>"{r.text}"</p>
      <p style={{ fontSize:13,fontWeight:600,color:'#1a1a1a',letterSpacing:'0.08em',marginBottom:4 }}>{r.name}</p>
      <p style={{ fontSize:12,color:'#b8860b',marginBottom:32 }}>"{r.title}"</p>
      <div style={{ display:'flex',justifyContent:'center',gap:8 }}>
        {REVIEWS.map((_,i)=>(
          <button key={i} onClick={()=>setIdx(i)}
            style={{ height:2,width:i===idx?32:12,background:i===idx?'#1a1a1a':'#d4b896',border:'none',cursor:'pointer',transition:'all .3s' }}/>
        ))}
      </div>
    </section>
  );
}
