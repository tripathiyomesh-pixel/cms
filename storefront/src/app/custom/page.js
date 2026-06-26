'use client';
import { useState } from 'react';
import Link from 'next/link';
import DynamicPage from '@/components/builder/DynamicPage';

const STEPS = [
  { n: '01', title: 'Share Your Vision', desc: 'Tell us about the piece you have in mind — a sketch, a reference image, or just words.' },
  { n: '02', title: 'Meet Our Artisans', desc: 'We arrange a private consultation at your preferred boutique or via video call.' },
  { n: '03', title: 'Design & Approval', desc: 'Our team creates detailed renderings for your review and approval before crafting begins.' },
  { n: '04', title: 'Crafted for You', desc: 'Your piece is handcrafted and delivered with full certification and lifetime care support.' },
];

function StaticCustomPage() {
  const [form, setForm]       = useState({ first_name:'', last_name:'', email:'', phone:'', country_code:'+971', description:'', budget:'' });
  const [submitting, setSub]  = useState(false);
  const [done, setDone]       = useState(false);
  const [err, setErr]         = useState('');

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.description) return setErr('Please fill in your name and describe your vision.');
    setSub(true); setErr('');
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${api}/custom-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Submission failed');
      setDone(true);
    } catch (e) {
      setErr('Something went wrong. Please try WhatsApp instead.');
    }
    setSub(false);
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Hero */}
      <div style={{ background: 'var(--color-text)', padding: '100px 40px 80px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 16 }}>Bespoke Jewellery</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(40px,6vw,72px)', fontWeight: 300, color: '#fff', lineHeight: 1.1, marginBottom: 20 }}>
          Create Your Dream Piece
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
          Our master craftsmen will bring your vision to life — a jewel that is uniquely, entirely yours.
        </p>
      </div>

      {/* Process steps */}
      <div style={{ background: '#faf8f3', padding: '80px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 12 }}>The Process</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 300, textAlign: 'center', color: 'var(--color-text)', marginBottom: 56 }}>
            From Vision to Reality
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 300, color: '#e5ddd0', lineHeight: 1, marginBottom: 16 }}>{s.n}</p>
                <h3 style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text)', marginBottom: 12 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#6b6b6b', lineHeight: 1.8 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enquiry form */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '80px 40px' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: 12 }}>Start Your Journey</p>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 300, color: 'var(--color-text)', marginBottom: 8 }}>
          Tell Us Your Vision
        </h2>
        <p style={{ color: '#6b6b6b', marginBottom: 40, lineHeight: 1.7 }}>
          Share the details below and one of our consultants will be in touch within 24 hours.
        </p>

        {done ? (
          <div style={{ background: '#f0f9f4', border: '1px solid #c8e6c9', borderRadius: 8, padding: 32, textAlign: 'center' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>✓</p>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 300, marginBottom: 8, color: 'var(--color-text)' }}>Enquiry Received</h3>
            <p style={{ color: '#6b6b6b', lineHeight: 1.7 }}>Thank you! Our team will contact you within 24 hours to discuss your bespoke piece.</p>
          </div>
        ) : (
          <form onSubmit={submit}>
            {err && <p style={{ color: '#c62828', fontSize: 13, marginBottom: 16 }}>{err}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>First Name *</label>
                <input value={form.first_name} onChange={e => set('first_name', e.target.value)} required
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e0d8', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Last Name</label>
                <input value={form.last_name} onChange={e => set('last_name', e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e0d8', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e0d8', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Phone (WhatsApp)</label>
                <div style={{ display: 'flex' }}>
                  <select value={form.country_code} onChange={e => set('country_code', e.target.value)}
                    style={{ padding: '12px 8px', border: '1px solid #e5e0d8', borderRight: 'none', fontSize: 13, background: '#faf8f3', outline: 'none' }}>
                    {['+971','+966','+965','+973','+968','+974','+91','+44','+1'].map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="501234567"
                    style={{ flex: 1, padding: '12px 16px', border: '1px solid #e5e0d8', fontSize: 14, outline: 'none' }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Describe Your Vision *</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={5} required
                placeholder="Tell us about the piece you have in mind — type of jewellery, occasion, gemstone preferences, any reference images you can share..."
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e0d8', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
            </div>

            <div style={{ marginBottom: 32 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#888', marginBottom: 8 }}>Approximate Budget</label>
              <select value={form.budget} onChange={e => set('budget', e.target.value)}
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #e5e0d8', fontSize: 14, outline: 'none', background: '#fff' }}>
                <option value="">Select a range</option>
                <option>AED 5,000 – 15,000</option>
                <option>AED 15,000 – 30,000</option>
                <option>AED 30,000 – 60,000</option>
                <option>AED 60,000 – 100,000</option>
                <option>AED 100,000+</option>
                <option>Let us advise</option>
              </select>
            </div>

            <button type="submit" disabled={submitting}
              style={{ width: '100%', background: submitting ? '#aaa' : 'var(--color-text)', color: '#fff', border: 'none', padding: '16px', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', cursor: submitting ? 'not-allowed' : 'pointer' }}>
              {submitting ? 'Sending...' : 'Submit Enquiry'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 16 }}>
              Prefer WhatsApp?{' '}
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || '971501234567'}?text=${encodeURIComponent('Hi, I\'d like to enquire about a bespoke jewellery piece.')}`}
                target="_blank" rel="noreferrer" style={{ color: '#25D366', fontWeight: 600 }}>
                Chat with us directly
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CustomPage() {
  return <DynamicPage pageId="bespoke" fallback={<StaticCustomPage />} />;
}
