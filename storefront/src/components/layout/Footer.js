'use client';
import Link from 'next/link';

export default function Footer({ template, config }) {
  const accent  = template?.colors?.accent   || '#c9a84c';
  const bg      = template?.colors?.bg === '#ffffff' ? '#1a1a1a' : template?.colors?.bg || '#0a0a0a';
  const text    = '#a0a0a0';
  const heading = template?.fonts?.heading   || "'Playfair Display', Georgia, serif";
  const wapp    = process.env.NEXT_PUBLIC_WHATSAPP;

  return (
    <footer style={{ background: bg, color: text, fontFamily: template?.fonts?.body }}>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'60px 24px 32px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:40, marginBottom:48 }}>
          
          {/* Brand */}
          <div>
            <div style={{ fontFamily: heading, fontSize:24, color:'#fff', marginBottom:12, letterSpacing:'0.05em' }}>TEJORI</div>
            <p style={{ fontSize:12, lineHeight:1.8, maxWidth:220, color: text }}>
              Fine jewellery crafted with a 60-year legacy. GIA & IGI certified diamonds and gemstones.
            </p>
            {/* Social */}
            <div style={{ display:'flex', gap:12, marginTop:20 }}>
              {[
                { name:'Instagram', href:`https://instagram.com`, icon:'📷' },
                { name:'WhatsApp',  href:`https://wa.me/${wapp||''}`, icon:'💬' },
                { name:'Facebook',  href:'https://facebook.com', icon:'📘' },
              ].map(s => (
                <a key={s.name} href={s.href} target="_blank" rel="noreferrer"
                  title={s.name}
                  style={{ fontSize:16, opacity:0.7, textDecoration:'none', transition:'opacity .2s' }}
                  onMouseEnter={e=>e.currentTarget.style.opacity='1'}
                  onMouseLeave={e=>e.currentTarget.style.opacity='0.7'}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Customer Care */}
          <div>
            <h4 style={{ fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#fff', marginBottom:16 }}>Customer Care</h4>
            {[['Contact Us','/contact'],['FAQ','/faq'],['Book Appointment','/appointment'],['Jewellery Care','/blog?cat=care']].map(([l,h])=>(
              <Link key={l} href={h} style={{ display:'block', fontSize:12, color: text, textDecoration:'none', marginBottom:10, transition:'color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.color=accent}
                onMouseLeave={e=>e.currentTarget.style.color=text}>
                {l}
              </Link>
            ))}
          </div>

          {/* Our Company */}
          <div>
            <h4 style={{ fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#fff', marginBottom:16 }}>Our Company</h4>
            {[['About Us','/about'],['Find a Boutique','/boutiques'],['Exhibitions','/exhibitions'],['Customisation','/custom'],['Ring Builder','/ring-builder']].map(([l,h])=>(
              <Link key={l} href={h} style={{ display:'block', fontSize:12, color: text, textDecoration:'none', marginBottom:10, transition:'color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.color=accent}
                onMouseLeave={e=>e.currentTarget.style.color=text}>
                {l}
              </Link>
            ))}
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ fontSize:11, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', color:'#fff', marginBottom:16 }}>Shop</h4>
            {[['High Jewellery','/jewellery?is_featured=true'],['Diamonds','/diamonds'],['Gemstones','/gemstones'],['Pearls','/pearls'],['Lab Grown','/diamonds?type=LAB_GROWN'],['New Arrivals','/jewellery?is_new=true']].map(([l,h])=>(
              <Link key={l} href={h} style={{ display:'block', fontSize:12, color: text, textDecoration:'none', marginBottom:10, transition:'color .2s' }}
                onMouseEnter={e=>e.currentTarget.style.color=accent}
                onMouseLeave={e=>e.currentTarget.style.color=text}>
                {l}
              </Link>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div style={{ borderTop:`1px solid rgba(255,255,255,0.08)`, paddingTop:24, marginBottom:24, display:'flex', gap:24, flexWrap:'wrap', alignItems:'center', justifyContent:'center' }}>
          {['GIA','IGI','HRD','AGS','GCAL'].map(c=>(
            <span key={c} style={{ fontFamily: heading, fontSize:14, fontWeight:700, color:'rgba(255,255,255,0.25)', letterSpacing:'0.1em' }}>{c}</span>
          ))}
        </div>

        {/* Bottom */}
        <div style={{ borderTop:`1px solid rgba(255,255,255,0.06)`, paddingTop:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Tejori. All rights reserved.</p>
          <div style={{ display:'flex', gap:16 }}>
            {[['Privacy Policy','/privacy'],['Terms','/terms'],['Sitemap','/sitemap.xml']].map(([l,h])=>(
              <Link key={l} href={h} style={{ fontSize:11, color:'rgba(255,255,255,0.3)', textDecoration:'none' }}>{l}</Link>
            ))}
          </div>
        </div>
      </div>

      {/* WhatsApp floating */}
      {wapp && (
        <a href={`https://wa.me/${wapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
          style={{ position:'fixed', bottom:24, right:24, zIndex:500, width:52, height:52, background:'#25d366', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(37,211,102,0.4)', textDecoration:'none', fontSize:24 }}>
          💬
        </a>
      )}
    </footer>
  );
}
