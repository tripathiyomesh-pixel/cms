'use client';
const REVIEWS = [
  { name:'Saitama One',   title:'Fabulous Grounds',   text:'An extraordinary experience from the moment we walked in. The craftsmanship is beyond compare.', rating:5 },
  { name:'Sara Colinton', title:'Perfect Ring',        text:'The attention to detail in every piece is remarkable. We found our perfect engagement ring.', rating:5 },
  { name:'Shetty Jamie',  title:'Stunning Design',     text:'TEJORI has redefined luxury for us. Every visit feels like stepping into a world of elegance.', rating:5 },
];
export default function TestimonialsGrid({ config={} }) {
  const bg = config.testimonials_bg || '#fff';
  return (
    <section style={{ padding:'80px 60px', background:bg }}>
      <div style={{ maxWidth:1200,margin:'0 auto' }}>
        <p style={{ fontSize:10,fontWeight:500,letterSpacing:'0.3em',textTransform:'uppercase',color:'var(--color-accent)',textAlign:'center',marginBottom:12 }}>
          {config.testimonials_label||'What Our Clients Say'}
        </p>
        <h2 style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:44,fontWeight:300,color:'var(--color-text)',textAlign:'center',marginBottom:56 }}>Client Stories</h2>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:32 }}>
          {REVIEWS.map((r,i)=>(
            <div key={i} style={{ padding:32,border:'1px solid #e5e0d8',background:'#fff' }}>
              <div style={{ color:'var(--color-accent)',fontSize:16,letterSpacing:3,marginBottom:20 }}>{'★'.repeat(r.rating)}</div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontWeight:300,fontStyle:'italic',color:'var(--color-text)',lineHeight:1.7,marginBottom:24 }}>"{r.text}"</p>
              <div style={{ borderTop:'1px solid #f0ede8',paddingTop:16 }}>
                <p style={{ fontSize:12,fontWeight:600,color:'var(--color-text)' }}>{r.name}</p>
                <p style={{ fontSize:11,color:'var(--color-accent)',marginTop:2 }}>"{r.title}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
