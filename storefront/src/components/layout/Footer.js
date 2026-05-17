import Link from 'next/link';

export default function Footer({ template }) {
  const isDark  = ['luxury-dark','diamond-dealer'].includes(template?.id);
  const isWarm  = template?.id === 'boutique-warm';
  const bg      = isDark ? '#0a0a0a'  : isWarm ? '#3d2b1a'  : '#1a1a1a';
  const text    = isDark ? '#f5f0e8'  : '#ffffff';
  const muted   = isDark ? 'rgba(245,240,232,0.35)' : isWarm ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.4)';
  const accent  = template?.colors?.accent || '#c9a84c';
  const border  = isDark ? '#1a1a1a' : isWarm ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.08)';
  const year    = new Date().getFullYear();

  return (
    <footer style={{ background:bg, color:text, marginTop:0 }}>
      <div style={{ maxWidth:1200, margin:'0 auto', padding:'60px 40px 40px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:40, marginBottom:48 }}>
          {/* Brand */}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:28, height:28, background:accent, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <polygon points="8,1 15,5 15,11 8,15 1,11 1,5" fill="none" stroke="#fff" strokeWidth="1.5"/>
                </svg>
              </div>
              <span style={{ fontFamily:"'Playfair Display', serif", fontSize:17, color:text }}>{process.env.NEXT_PUBLIC_STORE_NAME||'JewelCMS'}</span>
            </div>
            <p style={{ color:muted, fontSize:13, lineHeight:1.7, marginBottom:20, maxWidth:260 }}>
              Certified diamonds, coloured gemstones, pearls and fine jewellery. GIA & IGI certified.
            </p>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||''}`} target="_blank" rel="noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#25d366', color:'#fff', padding:'10px 18px', borderRadius:50, fontSize:13, fontWeight:600, textDecoration:'none' }}>
              💬 WhatsApp Us
            </a>
          </div>

          {/* Inventory */}
          <div>
            <h4 style={{ color:text, fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>Inventory</h4>
            {[['Natural Diamonds','/diamonds?type=NATURAL'],['Lab Diamonds','/diamonds?type=LAB_GROWN'],['Gemstones','/gemstones'],['Pearls','/pearls'],['Mountings','/mountings'],['Fine Jewellery','/jewellery']].map(([l,h])=>(
              <Link key={l} href={h} style={{ display:'block', color:muted, fontSize:13, marginBottom:10, textDecoration:'none' }}>{l}</Link>
            ))}
          </div>

          {/* Services */}
          <div>
            <h4 style={{ color:text, fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>Services</h4>
            {[['Ring Builder','/ring-builder'],['Custom Jewellery','/custom'],['Appointments','/appointment'],['Verify Certificate','/verify'],['Blog','/blog']].map(([l,h])=>(
              <Link key={l} href={h} style={{ display:'block', color:muted, fontSize:13, marginBottom:10, textDecoration:'none' }}>{l}</Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color:text, fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:16 }}>Contact</h4>
            <p style={{ color:muted, fontSize:13, lineHeight:1.7 }}>Dubai, UAE</p>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||''}`} style={{ display:'block', color:accent, fontSize:13, marginTop:8, textDecoration:'none' }}>WhatsApp us</a>
          </div>
        </div>

        <div style={{ borderTop:`1px solid ${border}`, paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <p style={{ color:muted, fontSize:12 }}>© {year} {process.env.NEXT_PUBLIC_STORE_NAME||'JewelCMS'}. All rights reserved.</p>
          <p style={{ color:muted, fontSize:12 }}>Powered by <span style={{ color:accent, fontWeight:500 }}>JewelCMS</span> · KenTech Global</p>
        </div>
      </div>
    </footer>
  );
}
