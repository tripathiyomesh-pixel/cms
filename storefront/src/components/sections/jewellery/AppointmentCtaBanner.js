'use client';
import Link from 'next/link';

export default function AppointmentCtaBanner({
  heading     = 'Experience Jewellery the Way It Was Meant to Be',
  subheading  = 'Book a private viewing at our boutique. A personal jewellery expert will guide you through our collection.',
  ctaPrimary  = { label:'Book a Private Appointment', href:'/appointment' },
  ctaSecondary= { label:'WhatsApp Us', href:'' },   // empty = use NEXT_PUBLIC_WHATSAPP
  bgStyle     = 'dark',    // 'dark' | 'cream' | 'image' | 'accent'
  bgImage     = '',        // URL — used when bgStyle === 'image'
  overlayOpacity = 60,     // used when bgStyle === 'image'
  layout      = 'centered',  // 'centered' | 'split' | 'minimal'
  features    = [
    { icon:'🕐', text:'Flexible scheduling, including weekends' },
    { icon:'🎁', text:'Complimentary refreshments & gift wrapping' },
    { icon:'💎', text:'Access to unreleased pieces & bespoke options' },
  ],
}) {
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;
  const waHref = ctaSecondary.href || (wapp ? `https://wa.me/${wapp.replace(/\D/g,'')}?text=I'd%20like%20to%20book%20an%20appointment` : '/contact');

  const COLORS = {
    dark:  { bg:'#0e0e0e', text:'#f5f0e8', muted:'#8a8078', btnBg:'var(--color-accent,#c9a84c)', btnText:'#0a0a0a', btnOutline:'rgba(255,255,255,0.2)', btnOutlineText:'#f5f0e8' },
    cream: { bg:'#fdf6ec', text:'#3d2b1a', muted:'#8b6f4a', btnBg:'var(--color-accent,#c9a84c)', btnText:'#fff',    btnOutline:'#e8d5bc',               btnOutlineText:'#3d2b1a' },
    accent:{ bg:'var(--color-accent,#c9a84c)', text:'#0a0a0a', muted:'rgba(0,0,0,0.55)', btnBg:'#0a0a0a', btnText:'#f5f0e8', btnOutline:'rgba(0,0,0,0.2)', btnOutlineText:'#0a0a0a' },
    image: { bg:'transparent', text:'#f5f0e8', muted:'rgba(245,240,232,0.7)', btnBg:'var(--color-accent,#c9a84c)', btnText:'#0a0a0a', btnOutline:'rgba(255,255,255,0.3)', btnOutlineText:'#f5f0e8' },
  };
  const c = COLORS[bgStyle] || COLORS.dark;

  const wrapperStyle = bgStyle === 'image' && bgImage ? {
    backgroundImage: `url(${bgImage})`,
    backgroundSize:  'cover',
    backgroundPosition: 'center',
    position: 'relative',
  } : { background: c.bg };

  const btnBase = { display:'inline-flex', alignItems:'center', gap:8, padding:'14px 28px', fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', cursor:'pointer', transition:'all .2s', borderRadius:'var(--btn-radius,8px)', border:'none', whiteSpace:'nowrap' };

  // ── SPLIT LAYOUT ──────────────────────────────────────────────
  if (layout === 'split') {
    return (
      <section style={{ ...wrapperStyle, fontFamily:"var(--font-body,'Inter',system-ui,sans-serif)" }}>
        {bgStyle === 'image' && bgImage && (
          <div style={{ position:'absolute', inset:0, background:`rgba(0,0,0,${overlayOpacity/100})` }}/>
        )}
        <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'80px 32px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center', position:'relative' }}>
          <div>
            <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.25em', textTransform:'uppercase', color:'var(--color-accent,#c9a84c)', marginBottom:14 }}>Boutique Experience</p>
            <h2 style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:36, fontWeight:'var(--font-heading-weight,400)', color:c.text, lineHeight:1.15, marginBottom:16 }}>{heading}</h2>
            <p style={{ fontSize:13, color:c.muted, lineHeight:1.8, marginBottom:32 }}>{subheading}</p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
              <Link href={ctaPrimary.href} style={{ ...btnBase, background:c.btnBg, color:c.btnText }}>
                📅 {ctaPrimary.label}
              </Link>
              <a href={waHref} target="_blank" rel="noreferrer" style={{ ...btnBase, background:'transparent', color:c.btnOutlineText, border:`1px solid ${c.btnOutline}` }}>
                💬 {ctaSecondary.label || 'WhatsApp Us'}
              </a>
            </div>
          </div>
          <div>
            {features.map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:16, padding:'20px 0', borderBottom: i < features.length-1 ? `1px solid ${c.btnOutline}` : 'none' }}>
                <span style={{ fontSize:24, flexShrink:0, lineHeight:1 }}>{f.icon}</span>
                <p style={{ fontSize:13, color:c.muted, lineHeight:1.6 }}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // ── MINIMAL LAYOUT ────────────────────────────────────────────
  if (layout === 'minimal') {
    return (
      <section style={{ ...wrapperStyle, padding:'40px 32px', fontFamily:"var(--font-body,'Inter',system-ui,sans-serif)" }}>
        {bgStyle === 'image' && bgImage && (
          <div style={{ position:'absolute', inset:0, background:`rgba(0,0,0,${overlayOpacity/100})` }}/>
        )}
        <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:20, position:'relative' }}>
          <div>
            <h2 style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:22, fontWeight:'var(--font-heading-weight,400)', color:c.text, marginBottom:4 }}>{heading}</h2>
            <p style={{ fontSize:12, color:c.muted }}>{subheading}</p>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <Link href={ctaPrimary.href} style={{ ...btnBase, background:c.btnBg, color:c.btnText, padding:'12px 22px' }}>
              {ctaPrimary.label}
            </Link>
            <a href={waHref} target="_blank" rel="noreferrer" style={{ ...btnBase, background:'transparent', color:c.btnOutlineText, border:`1px solid ${c.btnOutline}`, padding:'12px 22px' }}>
              💬
            </a>
          </div>
        </div>
      </section>
    );
  }

  // ── CENTERED LAYOUT (default) ─────────────────────────────────
  return (
    <section style={{ ...wrapperStyle, padding:'96px 32px', textAlign:'center', fontFamily:"var(--font-body,'Inter',system-ui,sans-serif)" }}>
      {bgStyle === 'image' && bgImage && (
        <div style={{ position:'absolute', inset:0, background:`rgba(0,0,0,${overlayOpacity/100})` }}/>
      )}
      <div style={{ maxWidth:720, margin:'0 auto', position:'relative' }}>
        <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', color:'var(--color-accent,#c9a84c)', marginBottom:16 }}>Private Appointment</p>
        <h2 style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:40, fontWeight:'var(--font-heading-weight,400)', color:c.text, lineHeight:1.1, marginBottom:20 }}>{heading}</h2>
        <p style={{ fontSize:14, color:c.muted, lineHeight:1.8, marginBottom:40 }}>{subheading}</p>

        {features.length > 0 && (
          <div style={{ display:'flex', justifyContent:'center', gap:40, flexWrap:'wrap', marginBottom:48 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:20 }}>{f.icon}</span>
                <span style={{ fontSize:12, color:c.muted, maxWidth:160, textAlign:'left', lineHeight:1.4 }}>{f.text}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href={ctaPrimary.href}
            style={{ ...btnBase, background:c.btnBg, color:c.btnText }}
            onMouseEnter={e=>e.currentTarget.style.opacity='0.9'}
            onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            📅 {ctaPrimary.label}
          </Link>
          <a href={waHref} target="_blank" rel="noreferrer"
            style={{ ...btnBase, background:'transparent', color:c.btnOutlineText, border:`1px solid ${c.btnOutline}` }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            💬 {ctaSecondary.label || 'WhatsApp Us'}
          </a>
        </div>

        <p style={{ fontSize:11, color:c.muted, marginTop:24 }}>
          Available Mon – Sat, 10am – 8pm · By appointment only
        </p>
      </div>
    </section>
  );
}
