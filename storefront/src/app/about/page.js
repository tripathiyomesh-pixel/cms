'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import DynamicPage from '@/components/builder/DynamicPage';

export const metadata = { title: 'About Us | TEJORI', description: 'The story of TEJORI — six decades of fine jewellery craftsmanship in Dubai, UAE.' };

// Static fallback shown if admin hasn't set up the About page yet
function StaticAbout() {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Hero */}
      <div style={{ background: '#1a1a1a', padding: '100px 40px 80px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8860b', marginBottom: 16 }}>Est. 1964</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px,6vw,72px)', fontWeight: 300, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
          About TEJORI
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
          Six decades of handcrafted brilliance, proudly rooted in Dubai.
        </p>
      </div>

      {/* Heritage story */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#b8860b', marginBottom: 16 }}>Our Heritage</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 300, color: '#1a1a1a', lineHeight: 1.1, marginBottom: 24 }}>
            A Story Woven in Gold Since 1964
          </h2>
          <div style={{ width: 40, height: 1, background: '#b8860b', marginBottom: 24 }} />
          <p style={{ color: '#6b6b6b', lineHeight: 1.9, marginBottom: 16, fontSize: 15 }}>
            It all began when Narottam Soni moved to Dubai with his brothers to establish a jewellery business. What began as a gold jewellery store soon evolved, as the Soni family became among the first jewellers to introduce diamond jewellery to the Middle East.
          </p>
          <p style={{ color: '#6b6b6b', lineHeight: 1.9, marginBottom: 32, fontSize: 15 }}>
            Today, TEJORI has grown to six retail locations across the UAE, continuing that same commitment to craftsmanship and authenticity that has earned the trust of generations.
          </p>
          <Link href="/boutiques" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#1a1a1a', borderBottom: '1px solid #1a1a1a', paddingBottom: 2 }}>
            Visit our boutiques →
          </Link>
        </div>
        <div style={{ background: '#f5ede2', aspectRatio: '4/5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80 }}>
          🏛️
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: '#1a1a1a', padding: '60px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 40, textAlign: 'center' }}>
          {[
            { num: '60+', label: 'Years of Legacy' },
            { num: '6',   label: 'UAE Boutiques' },
            { num: '50K+',label: 'Happy Clients' },
            { num: 'GIA', label: 'Certified Diamonds' },
          ].map(s => (
            <div key={s.label}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 300, color: '#b8860b', lineHeight: 1, marginBottom: 8 }}>{s.num}</p>
              <p style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '80px 40px', textAlign: 'center', background: '#faf8f3' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,4vw,48px)', fontWeight: 300, color: '#1a1a1a', marginBottom: 16 }}>
          Ready to Find Your Perfect Piece?
        </h2>
        <p style={{ color: '#6b6b6b', marginBottom: 32, maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.7 }}>
          Visit one of our boutiques or speak with our jewellery ambassadors on WhatsApp.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/boutiques" style={{ background: '#1a1a1a', color: '#fff', padding: '14px 36px', textDecoration: 'none', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            Find a Boutique
          </Link>
          <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '971501234567'}`}
            target="_blank" rel="noreferrer"
            style={{ background: '#25D366', color: '#fff', padding: '14px 36px', textDecoration: 'none', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            WhatsApp Us
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return <DynamicPage pageId="about" fallback={<StaticAbout />} />;
}
