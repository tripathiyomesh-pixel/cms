'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer({ template, config }) {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const wapp = process.env.NEXT_PUBLIC_WHATSAPP || '971501234567';
  const base = process.env.NEXT_PUBLIC_API_URL || '/api';

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setStatus('loading');
    try {
      const r = await fetch(`${base}/marketing/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'footer' }),
      });
      const data = await r.json();
      if (data.success) { setStatus('done'); setEmail(''); }
      else setStatus('error');
    } catch { setStatus('error'); }
  };

  return (
    <footer style={{ fontFamily:"'Inter', system-ui, sans-serif" }}>

      {/* Newsletter strip */}
      <div style={{ background:'#f5ede2', padding:'48px 32px', textAlign:'center' }}>
        <div style={{ maxWidth:500, margin:'0 auto' }}>
          <p style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:8 }}>
            Stay in the world of Tejori
          </p>
          <p style={{ fontSize:12, color:'#6b6b6b', marginBottom:24, letterSpacing:'0.05em' }}>
            Subscribe for 10% off your first purchase, new arrivals and exclusive offers.
          </p>
          {status === 'done' ? (
            <p style={{ fontSize:13, color:'#16a34a', fontWeight:500 }}>
              ✓ Thank you! Watch your inbox for something special.
            </p>
          ) : (
            <>
              <form onSubmit={handleSubscribe} style={{ display:'flex', gap:0, maxWidth:420, margin:'0 auto' }}>
                <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="Your email address"
                  style={{ flex:1, padding:'13px 18px', border:'1px solid #d4b896', borderRight:'none', fontSize:12, outline:'none', background:'#fff' }}/>
                <button type="submit" disabled={status==='loading'}
                  style={{ padding:'13px 24px', background: status==='loading' ? '#888' : '#1a1a1a', color:'#fff', border:'none', cursor: status==='loading' ? 'not-allowed' : 'pointer', fontSize:10, fontWeight:500, letterSpacing:'0.15em', textTransform:'uppercase', whiteSpace:'nowrap', transition:'background 0.2s' }}>
                  {status === 'loading' ? '…' : 'Subscribe'}
                </button>
              </form>
              {status === 'error' && (
                <p style={{ fontSize:11, color:'#dc2626', marginTop:8 }}>Something went wrong. Please try again.</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main footer */}
      <div style={{ background:'#1a1a1a', color:'#a0998e', padding:'60px 32px 32px' }}>
        <div style={{ maxWidth:'var(--max-width, 1320px)', margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(180px,1fr))', gap:48, marginBottom:56 }}>

            {/* Brand */}
            <div>
              <div style={{ marginBottom:16 }}>
                <Image
                  src="/tejori-logo.png"
                  alt="Tejori — Since 1964"
                  width={180}
                  height={76}
                  style={{ height: 48, width: 'auto', objectFit: 'contain' }}
                />
              </div>
              <p style={{ fontSize:11, lineHeight:1.9, color:'#6b6661', maxWidth:200 }}>
                A legacy of 60 years in fine jewellery. GIA & IGI certified diamonds, ethically sourced gemstones.
              </p>
            </div>

            {/* Customer Care */}
            <div>
              <h4 style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#fff', marginBottom:20 }}>Customer Care</h4>
              {[
                ['Contact Us',                '/contact'],
                ['FAQ',                       '/faq'],
                ['Jewellery Care Guide',      '/blog?cat=care'],
                ['Book a Service Appointment','/appointment'],
              ].map(([l,h]) => (
                <Link key={l} href={h}
                  style={{ display:'block', fontSize:12, color:'#a0998e', marginBottom:11, textDecoration:'none', transition:'color .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#d4a843'}
                  onMouseLeave={e=>e.currentTarget.style.color='#a0998e'}>
                  {l}
                </Link>
              ))}
            </div>

            {/* Our Company */}
            <div>
              <h4 style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#fff', marginBottom:20 }}>Our Company</h4>
              {[
                ['About TEJORI',   '/about'],
                ['Our Heritage',   '/about#heritage'],
                ['Boutique Finder','/boutiques'],
                ['Exhibitions',    '/exhibitions'],
                ['Bespoke Jewellery','/custom'],
              ].map(([l,h]) => (
                <Link key={l} href={h}
                  style={{ display:'block', fontSize:12, color:'#a0998e', marginBottom:11, textDecoration:'none', transition:'color .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#d4a843'}
                  onMouseLeave={e=>e.currentTarget.style.color='#a0998e'}>
                  {l}
                </Link>
              ))}
            </div>

            {/* Certifications + Contact */}
            <div>
              <h4 style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#fff', marginBottom:20 }}>Certified By</h4>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:24 }}>
                {['GIA','IGI','HRD','AGS'].map(cert=>(
                  <span key={cert} style={{ border:'1px solid rgba(255,255,255,0.12)', padding:'4px 10px', fontSize:10, fontWeight:500, letterSpacing:'0.1em', color:'rgba(255,255,255,0.4)' }}>
                    {cert}
                  </span>
                ))}
              </div>
              <h4 style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'#fff', marginBottom:12 }}>Contact</h4>
              <a href={`https://wa.me/${wapp}`} target="_blank" rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#1a7a35', color:'#fff', padding:'8px 14px', fontSize:11, textDecoration:'none', letterSpacing:'0.05em' }}>
                💬 WhatsApp
              </a>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', paddingTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
            <p style={{ fontSize:11, color:'#4a453f' }}>
              © {new Date().getFullYear()} TEJORI Jewellery LLC. All rights reserved.
            </p>
            <div style={{ display:'flex', gap:20 }}>
              {[['Privacy Policy','/privacy'],['Terms of Service','/terms']].map(([l,h])=>(
                <Link key={l} href={h}
                  style={{ fontSize:11, color:'#4a453f', textDecoration:'none', transition:'color .15s' }}
                  onMouseEnter={e=>e.currentTarget.style.color='#a0998e'}
                  onMouseLeave={e=>e.currentTarget.style.color='#4a453f'}>
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
