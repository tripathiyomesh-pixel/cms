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
          style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 1000, width: 54, height: 54, background: '#25d366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(37,211,102,0.35)', fontSize: 24, textDecoration: 'none' }}
          title="Chat with us on WhatsApp">
          💬
        </a>
      )}
    </footer>
  );
}
