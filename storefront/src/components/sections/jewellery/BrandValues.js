'use client';

const DEFAULT_VALUES = [
  {
    icon: '💎',
    heading: 'GIA & IGI Certified',
    body: 'Every diamond we offer carries an internationally recognised certification, guaranteeing quality, authenticity and peace of mind.',
  },
  {
    icon: '🔨',
    heading: 'Master Craftsmen',
    body: 'Each piece is handcrafted by artisans trained in generations-old techniques, refined for the modern luxury collector.',
  },
  {
    icon: '🌍',
    heading: 'Ethically Sourced',
    body: 'We partner exclusively with conflict-free suppliers and follow the Kimberley Process to ensure responsible sourcing.',
  },
  {
    icon: '📞',
    heading: 'Bespoke Service',
    body: 'From design consultation to final delivery, a dedicated jewellery expert accompanies you through every step.',
  },
];

export default function BrandValues({
  heading      = 'Why Choose Tejori',
  subheading   = 'Four promises we never compromise on',
  values       = DEFAULT_VALUES,
  layout       = 'grid',   // 'grid' | 'horizontal' | 'minimal'
  bgStyle      = 'cream',  // 'cream' | 'dark' | 'white' | 'accent'
}) {
  const BG = {
    cream:  { bg:'#fdf6ec', text:'#3d2b1a',  muted:'#8b6f4a', border:'#e8d5bc' },
    dark:   { bg:'#0e0e0e', text:'#f5f0e8',  muted:'#8a8078', border:'#2a2a2a' },
    white:  { bg:'#ffffff', text:'var(--color-text)',  muted:'#6b6b6b', border:'#e5e5e5' },
    accent: { bg:'var(--color-accent,#c9a84c)', text:'#0a0a0a', muted:'rgba(0,0,0,0.55)', border:'rgba(0,0,0,0.1)' },
  };
  const colors = BG[bgStyle] || BG.cream;

  if (layout === 'horizontal') {
    return (
      <section style={{ background: colors.bg, padding:'60px 32px', fontFamily:"var(--font-body,'Inter',system-ui,sans-serif)" }}>
        <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--color-accent,#c9a84c)', marginBottom:10 }}>Our Promise</p>
            <h2 style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:32, fontWeight:'var(--font-heading-weight,400)', color:colors.text, marginBottom:10 }}>{heading}</h2>
            {subheading && <p style={{ fontSize:13, color:colors.muted, maxWidth:480, margin:'0 auto' }}>{subheading}</p>}
          </div>
          <div style={{ display:'flex', gap:0, overflowX:'auto', borderTop:`1px solid ${colors.border}` }}>
            {values.map((v, i) => (
              <div key={i} style={{ flex:'1 0 200px', padding:'32px 24px', borderRight:`1px solid ${colors.border}`, textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:14 }}>{v.icon}</div>
                <h3 style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:16, fontWeight:'var(--font-heading-weight,400)', color:colors.text, marginBottom:8, lineHeight:1.3 }}>{v.heading}</h3>
                <p style={{ fontSize:12, color:colors.muted, lineHeight:1.7 }}>{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'minimal') {
    return (
      <section style={{ background: colors.bg, padding:'48px 32px', borderTop:`1px solid ${colors.border}`, borderBottom:`1px solid ${colors.border}`, fontFamily:"var(--font-body,'Inter',system-ui,sans-serif)" }}>
        <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', display:'flex', alignItems:'center', gap:40, flexWrap:'wrap', justifyContent:'center' }}>
          {values.map((v, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:20 }}>{v.icon}</span>
              <span style={{ fontSize:12, fontWeight:500, color:colors.text, whiteSpace:'nowrap', letterSpacing:'0.02em' }}>{v.heading}</span>
              {i < values.length - 1 && <span style={{ marginLeft:40, width:1, height:24, background:colors.border, display:'inline-block' }}/>}
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Default: grid
  return (
    <section style={{ background: colors.bg, padding:'80px 32px', fontFamily:"var(--font-body,'Inter',system-ui,sans-serif)" }}>
      <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:60 }}>
          <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--color-accent,#c9a84c)', marginBottom:12 }}>Our Promise</p>
          <h2 style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:36, fontWeight:'var(--font-heading-weight,400)', color:colors.text, marginBottom:12, lineHeight:1.15 }}>{heading}</h2>
          {subheading && <p style={{ fontSize:13, color:colors.muted, maxWidth:520, margin:'0 auto', lineHeight:1.7 }}>{subheading}</p>}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:2 }}>
          {values.map((v, i) => (
            <div key={i} style={{ padding:'40px 32px', border:`1px solid ${colors.border}`, background: bgStyle==='dark'?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.6)', transition:'transform .2s,box-shadow .2s' }}
              onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.07)'; }}
              onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
              <div style={{ fontSize:36, marginBottom:20 }}>{v.icon}</div>
              <h3 style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:18, fontWeight:'var(--font-heading-weight,400)', color:colors.text, marginBottom:10, lineHeight:1.3 }}>{v.heading}</h3>
              <p style={{ fontSize:12, color:colors.muted, lineHeight:1.8 }}>{v.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
