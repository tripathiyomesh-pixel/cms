import Link from 'next/link';

const FOOTER_LINKS = {
  jewellery: [
    { label:'Diamond Necklaces', href:'/jewellery?category=necklaces' },
    { label:'Diamond Earrings',  href:'/jewellery?category=earrings' },
    { label:'Diamond Bracelets', href:'/jewellery?category=bracelets' },
    { label:'Diamond Rings',     href:'/jewellery?category=rings' },
    { label:'Pearls',            href:'/pearls' },
    { label:'Collections',       href:'/jewellery' },
  ],
  services: [
    { label:'Bespoke Design',    href:'/custom' },
    { label:'Pick a Diamond',    href:'/diamonds' },
    { label:'Book Appointment',  href:'/appointment' },
    { label:'Gold Rate Today',   href:'/gold-rate' },
    { label:'Certification',     href:'/certification' },
    { label:'Lab-Grown Diamonds',href:'/lab-grown' },
  ],
  about: [
    { label:'Our Heritage',  href:'/about' },
    { label:'Boutiques',     href:'/boutiques' },
    { label:'Blog',          href:'/blog' },
    { label:'Exhibitions',   href:'/exhibitions' },
    { label:'Contact Us',    href:'/contact' },
    { label:'Sitemap',       href:'/sitemap' },
  ],
};

const SOCIAL = [
  { label:'Instagram', href:'https://instagram.com', icon:'📸' },
  { label:'WhatsApp',  href:'https://wa.me',         icon:'💬' },
  { label:'Facebook',  href:'https://facebook.com',  icon:'📘' },
  { label:'YouTube',   href:'https://youtube.com',   icon:'▶️' },
];

function NewsletterForm() {
  return (
    <form onSubmit={e => e.preventDefault()} style={{ display:'flex', maxWidth:400, marginTop:12 }}>
      <input type="email" placeholder="Your email address" required
        style={{ flex:1, padding:'10px 16px', fontSize:12, border:'1px solid rgba(255,255,255,0.15)', borderRight:'none', background:'rgba(255,255,255,0.08)', color:'#f5f0e8', outline:'none' }}/>
      <button type="submit" style={{ padding:'10px 20px', background:'var(--color-accent,#c9a84c)', color:'#0a0a0a', fontSize:11, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', border:'none', cursor:'pointer', whiteSpace:'nowrap' }}>
        Subscribe
      </button>
    </form>
  );
}

// ── FULL FOOTER (4 columns, default) ──────────────────────────
function FooterFull({ config }) {
  const showNewsletter = config?.theme_footer_newsletter === 'true';
  const showSocial     = config?.theme_footer_social     !== 'false';
  const cols           = parseInt(config?.theme_footer_columns || '4', 10);

  return (
    <footer style={{ background:'#0e0e0e', color:'#f5f0e8', fontFamily:"var(--font-body,'Inter',system-ui,sans-serif)" }}>
      {showNewsletter && (
        <div style={{ background:'var(--color-accent,#c9a84c)', padding:'28px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div>
            <p style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:20, fontWeight:'var(--font-heading-weight,400)', color:'#0a0a0a', marginBottom:4 }}>Stay in the World of Tejori</p>
            <p style={{ fontSize:11, color:'rgba(0,0,0,0.65)', letterSpacing:'0.05em' }}>New collections, exclusive previews and gold rate alerts</p>
          </div>
          <NewsletterForm/>
        </div>
      )}

      <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'56px 32px 40px', display:'grid', gridTemplateColumns:`repeat(${Math.min(cols,4)},1fr)`, gap:40 }}>
        <div>
          <Link href="/" style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:26, fontWeight:'var(--font-heading-weight,400)', letterSpacing:'0.18em', textTransform:'uppercase', color:'#f5f0e8', textDecoration:'none', display:'block', marginBottom:16 }}>TEJORI</Link>
          <p style={{ fontSize:12, color:'#8a8078', lineHeight:1.7, maxWidth:240, marginBottom:20 }}>Exceptional fine jewellery crafted for the discerning. GIA & IGI certified natural and lab-grown diamonds.</p>
          {showSocial && (
            <div style={{ display:'flex', gap:10 }}>
              {SOCIAL.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                  style={{ width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.08)', borderRadius:4, fontSize:14, textDecoration:'none', transition:'background .2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--color-accent,#c9a84c)'}
                  onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.08)'}>
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>

        {cols >= 2 && (
          <div>
            <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--color-accent,#c9a84c)', marginBottom:20 }}>Jewellery</p>
            {FOOTER_LINKS.jewellery.map(l=>(
              <Link key={l.label} href={l.href} style={{ display:'block', fontSize:12, color:'#8a8078', textDecoration:'none', padding:'5px 0', transition:'color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#f5f0e8'}
                onMouseLeave={e=>e.currentTarget.style.color='#8a8078'}>
                {l.label}
              </Link>
            ))}
          </div>
        )}

        {cols >= 3 && (
          <div>
            <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--color-accent,#c9a84c)', marginBottom:20 }}>Services</p>
            {FOOTER_LINKS.services.map(l=>(
              <Link key={l.label} href={l.href} style={{ display:'block', fontSize:12, color:'#8a8078', textDecoration:'none', padding:'5px 0', transition:'color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#f5f0e8'}
                onMouseLeave={e=>e.currentTarget.style.color='#8a8078'}>
                {l.label}
              </Link>
            ))}
          </div>
        )}

        {cols >= 4 && (
          <div>
            <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--color-accent,#c9a84c)', marginBottom:20 }}>About</p>
            {FOOTER_LINKS.about.map(l=>(
              <Link key={l.label} href={l.href} style={{ display:'block', fontSize:12, color:'#8a8078', textDecoration:'none', padding:'5px 0', transition:'color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#f5f0e8'}
                onMouseLeave={e=>e.currentTarget.style.color='#8a8078'}>
                {l.label}
              </Link>
            ))}
            <div style={{ marginTop:24, padding:'16px', background:'rgba(255,255,255,0.04)', borderRadius:4 }}>
              <p style={{ fontSize:9, color:'var(--color-accent,#c9a84c)', fontWeight:600, letterSpacing:'0.15em', marginBottom:6 }}>CERTIFIED BY</p>
              <p style={{ fontSize:11, color:'#8a8078' }}>GIA · IGI · SGL</p>
            </div>
          </div>
        )}
      </div>

      <div style={{ borderTop:'1px solid #1e1e1e', padding:'20px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <p style={{ fontSize:11, color:'#5a5450' }}>© {new Date().getFullYear()} Tejori. All rights reserved. Prices in AED.</p>
        <div style={{ display:'flex', gap:16 }}>
          {[['Privacy Policy','/privacy'],['Terms','/terms'],['Returns','/returns']].map(([l,h])=>(
            <Link key={l} href={h} style={{ fontSize:11, color:'#5a5450', textDecoration:'none', transition:'color .2s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#8a8078'}
              onMouseLeave={e=>e.currentTarget.style.color='#5a5450'}>
              {l}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ── COMPACT FOOTER (3 cols, no newsletter) ────────────────────
function FooterCompact({ config }) {
  const showSocial = config?.theme_footer_social !== 'false';
  return (
    <footer style={{ background:'#111', color:'#f5f0e8', fontFamily:"var(--font-body,'Inter',system-ui,sans-serif)" }}>
      <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'40px 32px 28px', display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr', gap:32 }}>
        <div>
          <Link href="/" style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:22, fontWeight:'var(--font-heading-weight,400)', letterSpacing:'0.18em', textTransform:'uppercase', color:'#f5f0e8', textDecoration:'none', display:'block', marginBottom:12 }}>TEJORI</Link>
          <p style={{ fontSize:11, color:'#6a6460', lineHeight:1.7, maxWidth:220, marginBottom:16 }}>GIA & IGI certified fine jewellery.</p>
          {showSocial && (
            <div style={{ display:'flex', gap:8 }}>
              {SOCIAL.map(s=>(
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                  style={{ width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.07)', borderRadius:3, fontSize:12, textDecoration:'none' }}>
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--color-accent,#c9a84c)', marginBottom:16 }}>Jewellery</p>
          {FOOTER_LINKS.jewellery.slice(0,5).map(l=>(
            <Link key={l.label} href={l.href} style={{ display:'block', fontSize:12, color:'#6a6460', textDecoration:'none', padding:'4px 0' }}>{l.label}</Link>
          ))}
        </div>
        <div>
          <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--color-accent,#c9a84c)', marginBottom:16 }}>Services</p>
          {FOOTER_LINKS.services.slice(0,5).map(l=>(
            <Link key={l.label} href={l.href} style={{ display:'block', fontSize:12, color:'#6a6460', textDecoration:'none', padding:'4px 0' }}>{l.label}</Link>
          ))}
        </div>
      </div>
      <div style={{ borderTop:'1px solid #1e1e1e', padding:'16px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <p style={{ fontSize:11, color:'#4a4440' }}>© {new Date().getFullYear()} Tejori</p>
        <div style={{ display:'flex', gap:12 }}>
          {[['Privacy','/privacy'],['Terms','/terms']].map(([l,h])=>(
            <Link key={l} href={h} style={{ fontSize:11, color:'#4a4440', textDecoration:'none' }}>{l}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ── MINIMAL FOOTER (2 cols) ───────────────────────────────────
function FooterMinimal({ config }) {
  const showSocial = config?.theme_footer_social !== 'false';
  return (
    <footer style={{ background:'var(--color-bg-secondary,#fafaf8)', borderTop:'1px solid var(--color-border,#e5e5e5)', fontFamily:"var(--font-body,'Inter',system-ui,sans-serif)" }}>
      <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto', padding:'40px 32px', display:'grid', gridTemplateColumns:'2fr 1fr', gap:40 }}>
        <div>
          <Link href="/" style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:20, fontWeight:'var(--font-heading-weight,400)', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--color-text,#1a1a1a)', textDecoration:'none', display:'block', marginBottom:10 }}>TEJORI</Link>
          <p style={{ fontSize:12, color:'var(--color-text-muted,#6b6b6b)', lineHeight:1.7, maxWidth:300 }}>Exceptional fine jewellery. GIA & IGI certified.</p>
          {showSocial && (
            <div style={{ display:'flex', gap:8, marginTop:14 }}>
              {SOCIAL.map(s=>(
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
                  style={{ width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--color-border,#e5e5e5)', borderRadius:3, fontSize:12, textDecoration:'none' }}>
                  {s.icon}
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--color-accent,#c9a84c)', marginBottom:14 }}>Quick Links</p>
          {[...FOOTER_LINKS.jewellery.slice(0,3), ...FOOTER_LINKS.about.slice(0,3)].map(l=>(
            <Link key={l.label} href={l.href} style={{ display:'block', fontSize:12, color:'var(--color-text-muted,#6b6b6b)', textDecoration:'none', padding:'3px 0' }}>{l.label}</Link>
          ))}
        </div>
      </div>
      <div style={{ borderTop:'1px solid var(--color-border,#e5e5e5)', padding:'14px 32px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8 }}>
        <p style={{ fontSize:11, color:'var(--color-text-muted,#6b6b6b)' }}>© {new Date().getFullYear()} Tejori. All rights reserved.</p>
        <div style={{ display:'flex', gap:12 }}>
          {[['Privacy','/privacy'],['Terms','/terms'],['Contact','/contact']].map(([l,h])=>(
            <Link key={l} href={h} style={{ fontSize:11, color:'var(--color-text-muted,#6b6b6b)', textDecoration:'none' }}>{l}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ── SINGLE ROW FOOTER ─────────────────────────────────────────
function FooterSingleRow({ config }) {
  const showSocial = config?.theme_footer_social !== 'false';
  return (
    <footer style={{ background:'var(--color-bg,#fff)', borderTop:'1px solid var(--color-border,#e5e5e5)', padding:'16px 32px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12, fontFamily:"var(--font-body,'Inter',system-ui,sans-serif)" }}>
      <Link href="/" style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:16, fontWeight:'var(--font-heading-weight,400)', letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--color-text,#1a1a1a)', textDecoration:'none', flexShrink:0 }}>
        TEJORI
      </Link>
      <div style={{ display:'flex', gap:16, flexWrap:'wrap', flex:1, justifyContent:'center' }}>
        {[
          { label:'Jewellery', href:'/jewellery' },
          { label:'Diamonds',  href:'/diamonds' },
          { label:'Bespoke',   href:'/custom' },
          { label:'About',     href:'/about' },
          { label:'Contact',   href:'/contact' },
        ].map(l=>(
          <Link key={l.label} href={l.href} style={{ fontSize:11, color:'var(--color-text-muted,#6b6b6b)', textDecoration:'none', whiteSpace:'nowrap', fontWeight:400, letterSpacing:'0.04em', textTransform:'uppercase' }}>
            {l.label}
          </Link>
        ))}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <p style={{ fontSize:11, color:'var(--color-text-muted,#6b6b6b)' }}>© {new Date().getFullYear()} Tejori</p>
        {showSocial && SOCIAL.slice(0,3).map(s=>(
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer" title={s.label}
            style={{ fontSize:14, textDecoration:'none' }}>
            {s.icon}
          </a>
        ))}
      </div>
    </footer>
  );
}

// ── MAIN EXPORT ────────────────────────────────────────────────
export default function Footer({ config }) {
  const style = config?.theme_footer_style || 'full';
  if (style === 'compact')    return <FooterCompact    config={config}/>;
  if (style === 'minimal')    return <FooterMinimal    config={config}/>;
  if (style === 'single_row') return <FooterSingleRow  config={config}/>;
  return <FooterFull config={config}/>;
}
