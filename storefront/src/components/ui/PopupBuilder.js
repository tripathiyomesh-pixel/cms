'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function PopupBuilder({ settings = {} }) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail]     = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!settings.popup_enabled || settings.popup_enabled === 'false') return;
    const dismissed = sessionStorage.getItem('popup_dismissed');
    if (dismissed) return;
    const delay = parseInt(settings.popup_delay || '3000');
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [settings]);

  const dismiss = () => {
    sessionStorage.setItem('popup_dismissed', '1');
    setVisible(false);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/subscribe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {}
    setSubmitted(true);
    setTimeout(dismiss, 2000);
  };

  if (!visible) return null;

  const type   = settings.popup_type || 'newsletter';
  const title  = settings.popup_title || 'Exclusive Offers';
  const msg    = settings.popup_message || 'Subscribe for early access.';
  const img    = settings.popup_image;
  const ctaUrl = settings.popup_cta_url || '/jewellery';
  const ctaTxt = settings.popup_cta_text || 'View Collection';
  const accent = '#c9a84c';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 8000, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
    }} onClick={dismiss}>
      <div style={{
        background: '#fff', borderRadius: 16, overflow: 'hidden', maxWidth: 480, width: '100%',
        boxShadow: '0 24px 64px rgba(0,0,0,0.3)', position: 'relative',
      }} onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button onClick={dismiss} style={{
          position: 'absolute', top: 12, right: 12, zIndex: 10,
          width: 28, height: 28, borderRadius: '50%', border: 'none',
          background: 'rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><X size={14}/></button>

        {/* Image */}
        {img && <div style={{ height: 200, overflow: 'hidden' }}>
          <img src={img} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        </div>}

        <div style={{ padding: type === 'image_only' ? 0 : 32 }}>
          {type !== 'image_only' && (
            <>
              {/* Accent bar */}
              <div style={{ width: 40, height: 3, background: accent, borderRadius: 2, marginBottom: 16 }}/>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 400, color: '#1a1a1a', marginBottom: 12 }}>{title}</h3>
              <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>{msg}</p>

              {type === 'newsletter' && !submitted && (
                <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8 }}>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
                    placeholder="Your email address"
                    style={{ flex:1, padding:'10px 14px', border:'1px solid #e0e0e0', borderRadius:8, fontSize:13, outline:'none' }}/>
                  <button type="submit" style={{ padding:'10px 20px', background:accent, color:'#0a0a0a', border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer', whiteSpace:'nowrap' }}>
                    Subscribe
                  </button>
                </form>
              )}
              {submitted && <p style={{ color: '#22c55e', fontWeight: 600 }}>✓ Thank you for subscribing!</p>}

              {(type === 'promotion' || type === 'announcement') && (
                <Link href={ctaUrl} onClick={dismiss} style={{
                  display: 'inline-block', padding: '12px 28px',
                  background: accent, color: '#0a0a0a', borderRadius: 8,
                  fontWeight: 700, fontSize: 14, textDecoration: 'none',
                }}>
                  {ctaTxt}
                </Link>
              )}

              {type === 'vip' && (
                <div style={{ background: '#fdf6ec', border: '1px solid #e8d5bc', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: '#8b6f4a', marginBottom: 8 }}>VIP Collection Access</p>
                  <Link href={ctaUrl} onClick={dismiss} style={{ padding:'10px 24px', background:'#8b5e3c', color:'#fff', borderRadius:6, fontWeight:700, fontSize:13, textDecoration:'none', display:'inline-block' }}>
                    {ctaTxt}
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
