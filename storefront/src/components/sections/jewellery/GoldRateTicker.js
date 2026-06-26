'use client';
import { useState, useEffect } from 'react';

const KARATS = ['24K', '22K', '21K', '18K', '14K'];

export default function GoldRateTicker({
  heading       = "Today's Gold Rate",
  subheading    = 'Dubai retail prices per gram · Updated daily',
  currency      = 'AED',
  showDisclaimer = true,
  bgStyle       = 'dark',  // 'dark' | 'cream' | 'white' | 'gold'
  layout        = 'bar',   // 'bar' | 'card' | 'compact'
}) {
  const [rates,   setRates]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(null);

  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    fetch(`${api}/gold-rates/current`)
      .then(r => r.json())
      .then(res => {
        if (res.data) {
          setRates(res.data);
          setUpdated(res.data.updated_at ? new Date(res.data.updated_at).toLocaleString('en-AE', { hour:'2-digit', minute:'2-digit', day:'numeric', month:'short' }) : null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const COLORS = {
    dark:  { bg:'#0e0e0e', text:'#f5f0e8',  muted:'#8a8078', card:'var(--color-text)', border:'#2a2a2a', label:'var(--color-accent,#c9a84c)' },
    cream: { bg:'#fdf6ec', text:'#3d2b1a',  muted:'#8b6f4a', card:'#fff',    border:'#e8d5bc', label:'var(--color-accent,#c9a84c)' },
    white: { bg:'#ffffff', text:'var(--color-text)',  muted:'#6b6b6b', card:'#fafaf8', border:'#e5e5e5', label:'var(--color-accent,#c9a84c)' },
    gold:  { bg:'var(--color-accent,#c9a84c)', text:'#0a0a0a', muted:'rgba(0,0,0,0.55)', card:'rgba(255,255,255,0.15)', border:'rgba(0,0,0,0.15)', label:'#0a0a0a' },
  };
  const c = COLORS[bgStyle] || COLORS.dark;

  const rateKeys = rates ? [
    { k:'rate_24k', label:'24 Karat' },
    { k:'rate_22k', label:'22 Karat' },
    { k:'rate_21k', label:'21 Karat' },
    { k:'rate_18k', label:'18 Karat' },
    { k:'rate_14k', label:'14 Karat' },
  ].filter(r => rates[r.k]) : [];

  // ── COMPACT TICKER BAR ────────────────────────────────────────
  if (layout === 'compact') {
    return (
      <div style={{ background: c.bg, padding:'10px 24px', borderTop:`1px solid ${c.border}`, borderBottom:`1px solid ${c.border}`, display:'flex', alignItems:'center', gap:24, overflowX:'auto', fontFamily:"var(--font-body,'Inter',system-ui,sans-serif)" }}>
        <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.2em', color: c.label, textTransform:'uppercase', flexShrink:0 }}>Gold Rate</span>
        {loading ? (
          <span style={{ fontSize:11, color:c.muted }}>Loading…</span>
        ) : rates ? rateKeys.map(r => (
          <div key={r.k} style={{ display:'flex', gap:6, alignItems:'baseline', flexShrink:0 }}>
            <span style={{ fontSize:10, color:c.muted }}>{r.label}</span>
            <span style={{ fontSize:13, fontWeight:600, color:c.text }}>{currency} {parseFloat(rates[r.k]).toLocaleString('en-AE', { minimumFractionDigits:2, maximumFractionDigits:2 })}</span>
          </div>
        )) : (
          <span style={{ fontSize:11, color:c.muted }}>Rates unavailable</span>
        )}
        {updated && <span style={{ fontSize:10, color:c.muted, marginLeft:'auto', flexShrink:0 }}>Updated {updated}</span>}
      </div>
    );
  }

  // ── BAR LAYOUT ────────────────────────────────────────────────
  if (layout === 'bar') {
    return (
      <section style={{ background: c.bg, padding:'48px 32px', fontFamily:"var(--font-body,'Inter',system-ui,sans-serif)" }}>
        <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:32 }}>
            <div>
              <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.25em', textTransform:'uppercase', color:c.label, marginBottom:10 }}>Live Market</p>
              <h2 style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:28, fontWeight:'var(--font-heading-weight,400)', color:c.text, marginBottom:6 }}>{heading}</h2>
              <p style={{ fontSize:12, color:c.muted }}>{subheading}</p>
            </div>
            {updated && <p style={{ fontSize:11, color:c.muted }}>Updated: {updated}</p>}
          </div>

          {loading ? (
            <div style={{ display:'flex', gap:12 }}>
              {[1,2,3,4,5].map(i => <div key={i} style={{ flex:1, height:80, background: bgStyle==='dark'?'var(--color-text)':'#f0ece6', borderRadius:4 }}/>)}
            </div>
          ) : rates ? (
            <div style={{ display:'flex', gap:2, flexWrap:'wrap' }}>
              {rateKeys.map((r, i) => (
                <div key={r.k} style={{ flex:'1 0 140px', padding:'24px 20px', background: c.card, border:`1px solid ${c.border}`, textAlign:'center' }}>
                  <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:c.label, marginBottom:10 }}>{r.label}</p>
                  <p style={{ fontSize:22, fontWeight:600, color:c.text, marginBottom:4, fontVariantNumeric:'tabular-nums' }}>
                    {parseFloat(rates[r.k]).toLocaleString('en-AE', { minimumFractionDigits:2, maximumFractionDigits:2 })}
                  </p>
                  <p style={{ fontSize:11, color:c.muted }}>{currency} / gram</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color:c.muted, fontSize:13 }}>Gold rates temporarily unavailable. Please call us for current prices.</p>
          )}

          {showDisclaimer && (
            <p style={{ fontSize:10, color:c.muted, marginTop:20, lineHeight:1.6 }}>
              Prices are retail indicative rates for Dubai. Actual jewellery prices vary based on making charges, stone quality and design. Contact us for exact pricing.
            </p>
          )}
        </div>
      </section>
    );
  }

  // ── CARD LAYOUT ───────────────────────────────────────────────
  return (
    <section style={{ background: c.bg, padding:'64px 32px', fontFamily:"var(--font-body,'Inter',system-ui,sans-serif)" }}>
      <div style={{ maxWidth:'var(--max-width,1320px)', margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <p style={{ fontSize:9, fontWeight:600, letterSpacing:'0.25em', textTransform:'uppercase', color:c.label, marginBottom:12 }}>Gold Prices</p>
          <h2 style={{ fontFamily:"var(--font-heading,'Playfair Display',serif)", fontSize:32, fontWeight:'var(--font-heading-weight,400)', color:c.text, marginBottom:10 }}>{heading}</h2>
          <p style={{ fontSize:13, color:c.muted }}>{subheading}</p>
        </div>

        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16 }}>
            {[1,2,3,4,5].map(i => <div key={i} style={{ height:120, background: c.card, borderRadius:8 }}/>)}
          </div>
        ) : rates ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16 }}>
            {rateKeys.map((r, i) => (
              <div key={r.k} style={{ padding:'28px 20px', background: c.card, border:`1px solid ${c.border}`, borderRadius:8, textAlign:'center', transition:'transform .2s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                <div style={{ width:48, height:48, background:'var(--color-accent,#c9a84c)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:20 }}>
                  {['🥇','🥈','🥉','💛','⭐'][i] || '💰'}
                </div>
                <p style={{ fontSize:10, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', color:c.label, marginBottom:8 }}>{r.label}</p>
                <p style={{ fontSize:24, fontWeight:600, color:c.text, marginBottom:4, fontVariantNumeric:'tabular-nums' }}>
                  {parseFloat(rates[r.k]).toLocaleString('en-AE', { minimumFractionDigits:2, maximumFractionDigits:2 })}
                </p>
                <p style={{ fontSize:11, color:c.muted }}>{currency} / gram</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign:'center', color:c.muted, fontSize:13 }}>Rates temporarily unavailable.</p>
        )}

        {showDisclaimer && (
          <p style={{ fontSize:10, color:c.muted, marginTop:24, textAlign:'center', lineHeight:1.6, maxWidth:600, margin:'24px auto 0' }}>
            Retail indicative rates for Dubai. Actual jewellery prices vary by making charges, stone quality and design.
          </p>
        )}
      </div>
    </section>
  );
}
