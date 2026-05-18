'use client';
import Link from 'next/link';

export default function Footer({ template, config }) {
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP;

  return (
    <footer style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Newsletter strip */}
      <div style={{ background: '#f5ede2', padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: '#1a1a1a', marginBottom: 8 }}>
            Stay in the world of Tejori
          </p>
          <p style={{ fontSize: 12, color: '#6b6b6b', marginBottom: 24, letterSpacing: '0.05em' }}>
            Subscribe for 10% off your first purchase, new arrivals and exclusive offers.
          </p>
          <form onSubmit={e => { e.preventDefault(); }} style={{ display: 'flex', gap: 0, maxWidth: 420, margin: '0 auto' }}>
            <input type="email" required placeholder="Your email address"
              style={{ flex: 1, padding: '13px 18px', border: '1px solid #d4b896', borderRight: 'none', fontSize: 12, outline: 'none', background: '#fff' }}/>
            <button type="submit"
              style={{ padding: '13px 24px', background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main footer */}
      <div style={{ background: '#1a1a1a', color: '#a0998e', padding: '60px 32px 32px' }}>
        <div style={{ maxWidth: 'var(--max-width, 1320px)', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 48, marginBottom: 56 }}>

            {/* Brand */}
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, color: '#fff', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>
                TEJORI
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.9, color: '#6b6661', maxWidth: 200 }}>
                A legacy of 60 years in fine jewellery. GIA & IGI certified diamonds, ethically sourced gemstones.
              </p>
            </div>

            {/* Customer Care */}
            <div>
              <h4 style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', marginBottom: 20 }}>Customer Care</h4>
              {[
                ['Contact Us',              '/contact'],
                ['FAQ',                     '/faq'],
                ['Jewellery Care Guide',    '/blog?cat=care'],
                ['Book a Service Appointment','/appointment'],
              ].map(([l,h]) => (
                <Link key={l} href={h}
                  style={{ display: 'block', fontSize: 12, color: '#a0998e', marginBottom: 11, transition: 'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#d4a843'}
                  onMouseLeave={e => e.currentTarget.style.color = '#a0998e'}>
                  {l}
                </Link>
              ))}
            </div>

            {/* Legal */}
            <div>
              <h4 style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', marginBottom: 20 }}>Legal</h4>
              {[
                ['Privacy Policy',                  '/privacy-policy'],
                ['Terms & Conditions',              '/terms'],
                ['Cookie Policy',                   '/cookie-policy'],
                ['Corporate Responsibility',        '/corporate-responsibility'],
                ['Returns & Exchanges',             '/returns'],
              ].map(([l,h]) => (
                <Link key={l} href={h}
                  style={{ display: 'block', fontSize: 12, color: '#a0998e', marginBottom: 11, transition: 'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#d4a843'}
                  onMouseLeave={e => e.currentTarget.style.color = '#a0998e'}>
                  {l}
                </Link>
              ))}
            </div>

            {/* Shop */}
            <div>
              <h4 style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', marginBottom: 20 }}>Shop</h4>
              {[
                ['High Jewellery',    '/jewellery?type=high'],
                ['Jewellery',         '/jewellery'],
                ['Lab-Diamond',       '/lab-grown'],
                ['Bespoke Services',  '/custom'],
                ['Exhibitions',       '/exhibitions'],
                ['Find a Boutique',   '/boutiques'],
              ].map(([l,h]) => (
                <Link key={l} href={h}
                  style={{ display: 'block', fontSize: 12, color: '#a0998e', marginBottom: 11, transition: 'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#d4a843'}
                  onMouseLeave={e => e.currentTarget.style.color = '#a0998e'}>
                  {l}
                </Link>
              ))}
            </div>

            {/* Follow Us */}
            <div>
              <h4 style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff', marginBottom: 20 }}>Follow Us</h4>
              {[
                ['Instagram',  'https://instagram.com', '📷'],
                ['Facebook',   'https://facebook.com',  '📘'],
                ['YouTube',    'https://youtube.com',   '▶️'],
                ['WhatsApp',   `https://wa.me/${wapp||''}`, '💬'],
              ].map(([l,h,icon]) => (
                <a key={l} href={h} target="_blank" rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#a0998e', marginBottom: 11, textDecoration: 'none', transition: 'color .15s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#d4a843'}
                  onMouseLeave={e => e.currentTarget.style.color = '#a0998e'}>
                  <span style={{ fontSize: 14 }}>{icon}</span> {l}
                </a>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28, marginBottom: 24, display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            {['GIA Certified','IGI Certified','HRD Antwerp','AGS','GCAL'].map(c => (
              <span key={c} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 12, fontWeight: 400, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{c}</span>
            ))}
          </div>

          {/* Bottom */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
              © {new Date().getFullYear()} Tejori. All rights reserved.
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.05em' }}>
              Crafted with care · GCC's finest jewellery
            </p>
          </div>
        </div>
      </div>

      {/* WhatsApp floating */}
      {wapp && (
        <a href={`https://wa.me/${wapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
          className="whatsapp-float"
          title="Chat with us on WhatsApp">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.523 5.847L.057 23.885l6.197-1.625A11.946 11.946 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.817 9.817 0 01-5.003-1.367l-.358-.214-3.724.977.994-3.634-.234-.373A9.818 9.818 0 1112 21.818z"/>
          </svg>
        </a>
      )}
    </footer>
  );
}
