'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar, MapPin, Clock, ChevronRight, ChevronLeft,
  Check, User, Phone, Mail, MessageSquare, Star,
} from 'lucide-react';

const BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
const WAPP = process.env.NEXT_PUBLIC_WHATSAPP || '971501234567';

const PURPOSES = [
  { id:'engagement',  label:'Engagement Ring',     icon:'💍', desc:'Find the perfect ring for your proposal' },
  { id:'bridal',      label:'Bridal Jewellery',    icon:'👰', desc:'Complete bridal sets and wedding bands' },
  { id:'diamonds',    label:'Diamond Viewing',     icon:'💎', desc:'View loose certified diamonds in person' },
  { id:'custom',      label:'Bespoke Creation',    icon:'✦',  desc:'Design a one-of-a-kind piece with our artisans' },
  { id:'gifting',     label:'Gifting',             icon:'🎁', desc:'Find a meaningful gift for a loved one' },
  { id:'repairs',     label:'Repairs & Resize',    icon:'🔧', desc:'Service, cleaning or resize existing jewellery' },
  { id:'lab',         label:'Lab-Grown Diamonds',  icon:'🔬', desc:'Explore our ethical lab-grown collection' },
  { id:'viewing',     label:'General Viewing',     icon:'✨', desc:'Browse our full collection at leisure' },
];

const TIMES = ['10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30'];

// ── Step indicators ──────────────────────────────────────────────────────────
function Steps({ current }) {
  const steps = ['Purpose','Location','Date & Time','Your Details','Confirm'];
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0, marginBottom:40 }}>
      {steps.map((s, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <div key={s} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <div style={{
                width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13, fontWeight:600, transition:'all 0.2s',
                background: done ? '#1a1a1a' : active ? '#b8860b' : 'transparent',
                border: done || active ? 'none' : '1.5px solid #ddd',
                color: done || active ? '#fff' : '#aaa',
              }}>
                {done ? <Check size={14}/> : i + 1}
              </div>
              <span style={{ fontSize:10, letterSpacing:'0.05em', textTransform:'uppercase', fontWeight:500, color: active ? '#1a1a1a' : '#aaa', whiteSpace:'nowrap' }}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ width:40, height:1, background: done ? '#1a1a1a' : '#e5e5e5', margin:'0 4px', marginBottom:22, flexShrink:0 }}/>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1 — Purpose ─────────────────────────────────────────────────────────
function StepPurpose({ value, onChange, onNext }) {
  return (
    <div>
      <p style={{ fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase', color:'#b8860b', textAlign:'center', marginBottom:12 }}>Step 1</p>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(24px,4vw,36px)', fontWeight:300, color:'#1a1a1a', textAlign:'center', marginBottom:8 }}>
        What brings you in?
      </h2>
      <p style={{ fontSize:13, color:'#888', textAlign:'center', marginBottom:32 }}>Select the purpose of your visit</p>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, maxWidth:560, margin:'0 auto 36px' }}>
        {PURPOSES.map(p => (
          <button key={p.id} onClick={() => { onChange(p.id); }}
            style={{
              padding:'16px 14px', border:`2px solid ${value === p.id ? '#b8860b' : '#e5e0d8'}`,
              background: value === p.id ? '#fdf8ee' : '#fff',
              cursor:'pointer', textAlign:'left', transition:'all 0.15s',
            }}>
            <div style={{ fontSize:22, marginBottom:8 }}>{p.icon}</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#1a1a1a', marginBottom:3 }}>{p.label}</div>
            <div style={{ fontSize:11, color:'#888', lineHeight:1.5 }}>{p.desc}</div>
          </button>
        ))}
      </div>
      <div style={{ textAlign:'center' }}>
        <button onClick={onNext} disabled={!value}
          style={{ background: value ? '#1a1a1a' : '#ddd', color:'#fff', border:'none', padding:'14px 48px', fontSize:12, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', cursor: value ? 'pointer' : 'not-allowed', display:'inline-flex', alignItems:'center', gap:8 }}>
          Continue <ChevronRight size={14}/>
        </button>
      </div>
    </div>
  );
}

// ── Step 2 — Location ────────────────────────────────────────────────────────
function StepLocation({ value, onChange, onNext, onBack }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetch(`${BASE}/storefront/store`)
      .then(r => r.json())
      .then(res => setLocations(res.data?.locations || []))
      .catch(() => setLocations([]))
      .finally(() => setLoading(false));
  }, []);

  // Fallback locations if API not yet returning
  const display = locations.length > 0 ? locations : [
    { id:'dubai-mall',       name:'Dubai Mall',          area:'Downtown Dubai',    hours:'10am – 10pm daily' },
    { id:'madinat',          name:'Madinat Jumeirah',    area:'Souk Madinat',      hours:'10am – 10pm daily' },
    { id:'gold-souk',        name:'Gold Souk',           area:'Deira, Dubai',      hours:'Sat–Thu 10am–9pm'  },
    { id:'zabeel-saray',     name:'Zabeel Saray',        area:'Palm Jumeirah',     hours:'10am – 10pm daily' },
    { id:'ibn-battuta',      name:'Ibn Battuta Mall',    area:'Jebel Ali',         hours:'10am – 10pm daily' },
    { id:'dubai-festival',   name:'Dubai Festival City', area:'Festival City',     hours:'10am – 10pm daily' },
  ];

  return (
    <div>
      <p style={{ fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase', color:'#b8860b', textAlign:'center', marginBottom:12 }}>Step 2</p>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(24px,4vw,36px)', fontWeight:300, color:'#1a1a1a', textAlign:'center', marginBottom:8 }}>
        Choose your boutique
      </h2>
      <p style={{ fontSize:13, color:'#888', textAlign:'center', marginBottom:32 }}>Select the location most convenient for you</p>

      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, maxWidth:560, margin:'0 auto 36px' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height:80, background:'#f5f5f5', animation:'pulse 1.5s ease infinite' }}/>)}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:12, maxWidth:560, margin:'0 auto 36px' }}>
          {display.map(loc => (
            <button key={loc.id || loc.name} onClick={() => onChange(loc.id || loc.name)}
              style={{
                padding:'16px', border:`2px solid ${value === (loc.id || loc.name) ? '#b8860b' : '#e5e0d8'}`,
                background: value === (loc.id || loc.name) ? '#fdf8ee' : '#fff',
                cursor:'pointer', textAlign:'left', transition:'all 0.15s',
              }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:10 }}>
                <MapPin size={16} style={{ color:'#b8860b', flexShrink:0, marginTop:1 }}/>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#1a1a1a', marginBottom:2 }}>{loc.name}</div>
                  <div style={{ fontSize:11, color:'#888' }}>{loc.area}</div>
                  {loc.hours && <div style={{ fontSize:11, color:'#b8860b', marginTop:2 }}>{loc.hours}</div>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'center', gap:12 }}>
        <button onClick={onBack}
          style={{ background:'#fff', color:'#1a1a1a', border:'1px solid #e5e0d8', padding:'14px 32px', fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
          <ChevronLeft size={14}/> Back
        </button>
        <button onClick={onNext} disabled={!value}
          style={{ background: value ? '#1a1a1a' : '#ddd', color:'#fff', border:'none', padding:'14px 48px', fontSize:12, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', cursor: value ? 'pointer' : 'not-allowed', display:'inline-flex', alignItems:'center', gap:8 }}>
          Continue <ChevronRight size={14}/>
        </button>
      </div>
    </div>
  );
}

// ── Step 3 — Date & Time ─────────────────────────────────────────────────────
function StepDateTime({ date, time, onDateChange, onTimeChange, onNext, onBack }) {
  const [slots, setSlots]   = useState([]);
  const [loading, setLoading] = useState(false);

  // Build next 30 days excluding Sundays
  const dates = [];
  const d = new Date();
  d.setDate(d.getDate() + 1);
  while (dates.length < 30) {
    if (d.getDay() !== 0) dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    fetch(`${BASE}/appointments/slots?date=${date}`)
      .then(r => r.json())
      .then(res => setSlots(res.data?.available_slots || TIMES))
      .catch(() => setSlots(TIMES))
      .finally(() => setLoading(false));
  }, [date]);

  const fmt = (d) => {
    const dt = new Date(d + 'T12:00:00');
    return dt.toLocaleDateString('en-AE', { weekday:'short', day:'numeric', month:'short' });
  };

  return (
    <div>
      <p style={{ fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase', color:'#b8860b', textAlign:'center', marginBottom:12 }}>Step 3</p>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(24px,4vw,36px)', fontWeight:300, color:'#1a1a1a', textAlign:'center', marginBottom:8 }}>
        Select date & time
      </h2>
      <p style={{ fontSize:13, color:'#888', textAlign:'center', marginBottom:32 }}>Boutiques open Sat–Thu, 10am–6pm</p>

      <div style={{ maxWidth:560, margin:'0 auto' }}>
        {/* Date picker — scrollable row */}
        <div style={{ marginBottom:28 }}>
          <p style={{ fontSize:11, fontWeight:600, color:'#888', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12 }}>Select date</p>
          <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:8 }}>
            {dates.map(d => {
              const iso = d.toISOString().split('T')[0];
              const sel = iso === date;
              return (
                <button key={iso} onClick={() => { onDateChange(iso); onTimeChange(''); }}
                  style={{
                    flexShrink:0, padding:'10px 14px', border:`2px solid ${sel ? '#b8860b' : '#e5e0d8'}`,
                    background: sel ? '#fdf8ee' : '#fff', cursor:'pointer', transition:'all 0.15s', textAlign:'center',
                  }}>
                  <div style={{ fontSize:10, color: sel ? '#b8860b' : '#888', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>
                    {d.toLocaleDateString('en-AE', { weekday:'short' })}
                  </div>
                  <div style={{ fontSize:16, fontWeight:600, color:'#1a1a1a', lineHeight:1 }}>
                    {d.getDate()}
                  </div>
                  <div style={{ fontSize:10, color:'#888', marginTop:2 }}>
                    {d.toLocaleDateString('en-AE', { month:'short' })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        {date && (
          <div style={{ marginBottom:36 }}>
            <p style={{ fontSize:11, fontWeight:600, color:'#888', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:12 }}>Select time</p>
            {loading ? (
              <p style={{ fontSize:13, color:'#aaa' }}>Checking availability…</p>
            ) : (
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {slots.map(t => (
                  <button key={t} onClick={() => onTimeChange(t)}
                    style={{
                      padding:'10px 16px', border:`2px solid ${time === t ? '#b8860b' : '#e5e0d8'}`,
                      background: time === t ? '#fdf8ee' : '#fff', cursor:'pointer',
                      fontSize:13, fontWeight:500, color: time === t ? '#b8860b' : '#555', transition:'all 0.15s',
                    }}>
                    {t}
                  </button>
                ))}
                {slots.length === 0 && (
                  <p style={{ fontSize:13, color:'#e24b4a' }}>No slots available for this date. Please choose another day.</p>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display:'flex', gap:12 }}>
          <button onClick={onBack}
            style={{ background:'#fff', color:'#1a1a1a', border:'1px solid #e5e0d8', padding:'14px 32px', fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
            <ChevronLeft size={14}/> Back
          </button>
          <button onClick={onNext} disabled={!date || !time}
            style={{ background: (date && time) ? '#1a1a1a' : '#ddd', color:'#fff', border:'none', padding:'14px 48px', fontSize:12, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', cursor:(date && time) ? 'pointer' : 'not-allowed', flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            Continue <ChevronRight size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 4 — Details ─────────────────────────────────────────────────────────
function StepDetails({ form, onChange, onNext, onBack }) {
  const inp = { width:'100%', padding:'12px 14px', border:'1px solid #e5e0d8', fontSize:13, outline:'none', background:'#fff', fontFamily:'inherit', boxSizing:'border-box' };
  const lbl = { display:'block', fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'#888', marginBottom:6 };
  const valid = form.customer_name && form.customer_phone;

  return (
    <div>
      <p style={{ fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase', color:'#b8860b', textAlign:'center', marginBottom:12 }}>Step 4</p>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(24px,4vw,36px)', fontWeight:300, color:'#1a1a1a', textAlign:'center', marginBottom:8 }}>
        Your details
      </h2>
      <p style={{ fontSize:13, color:'#888', textAlign:'center', marginBottom:32 }}>We'll confirm your appointment via WhatsApp</p>

      <div style={{ maxWidth:480, margin:'0 auto' }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
          <div>
            <label style={lbl}>First name *</label>
            <input value={form.customer_name?.split(' ')[0] || ''} placeholder="First name"
              onChange={e => onChange('customer_name', e.target.value + (form.customer_name?.includes(' ') ? ' ' + form.customer_name.split(' ').slice(1).join(' ') : ''))}
              style={inp}/>
          </div>
          <div>
            <label style={lbl}>Last name</label>
            <input value={form.customer_name?.split(' ').slice(1).join(' ') || ''} placeholder="Last name"
              onChange={e => onChange('customer_name', (form.customer_name?.split(' ')[0] || '') + (e.target.value ? ' ' + e.target.value : ''))}
              style={inp}/>
          </div>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={lbl}>WhatsApp number *</label>
          <div style={{ display:'flex' }}>
            <select defaultValue="+971"
              style={{ padding:'12px 8px', border:'1px solid #e5e0d8', borderRight:'none', fontSize:13, background:'#faf8f3', outline:'none', cursor:'pointer' }}>
              {['+971','+966','+965','+973','+968','+974','+91','+44','+1'].map(c => <option key={c}>{c}</option>)}
            </select>
            <input value={form.customer_phone} onChange={e => onChange('customer_phone', e.target.value)}
              placeholder="501234567" type="tel" style={{...inp, borderLeft:'none', flex:1}}/>
          </div>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={lbl}>Email address</label>
          <input value={form.customer_email} onChange={e => onChange('customer_email', e.target.value)}
            placeholder="your@email.com" type="email" style={inp}/>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={lbl}>Party size</label>
          <select value={form.party_size} onChange={e => onChange('party_size', e.target.value)}
            style={{...inp, cursor:'pointer'}}>
            {['1','2','3','4','5+'].map(n => <option key={n} value={n}>{n} {n==='1'?'person':'people'}</option>)}
          </select>
        </div>
        <div style={{ marginBottom:32 }}>
          <label style={lbl}>Notes (optional)</label>
          <textarea value={form.notes} onChange={e => onChange('notes', e.target.value)} rows={3}
            placeholder="Any specific pieces you'd like to see, or anything else we should know"
            style={{...inp, resize:'vertical'}}/>
        </div>

        <div style={{ display:'flex', gap:12 }}>
          <button onClick={onBack}
            style={{ background:'#fff', color:'#1a1a1a', border:'1px solid #e5e0d8', padding:'14px 32px', fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
            <ChevronLeft size={14}/> Back
          </button>
          <button onClick={onNext} disabled={!valid}
            style={{ background: valid ? '#1a1a1a' : '#ddd', color:'#fff', border:'none', padding:'14px 0', fontSize:12, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', cursor: valid ? 'pointer' : 'not-allowed', flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            Review booking <ChevronRight size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 5 — Confirm ─────────────────────────────────────────────────────────
function StepConfirm({ form, purpose, location, onBack, onSubmit, submitting }) {
  const purposeObj = PURPOSES.find(p => p.id === purpose);
  const fmtDate = form.preferred_date
    ? new Date(form.preferred_date + 'T12:00:00').toLocaleDateString('en-AE', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    : '';

  const rows = [
    { icon:<MapPin size={15}/>,    label:'Boutique',  value: location },
    { icon:<Calendar size={15}/>,  label:'Date',      value: fmtDate },
    { icon:<Clock size={15}/>,     label:'Time',      value: form.preferred_time },
    { icon:<User size={15}/>,      label:'Name',      value: form.customer_name },
    { icon:<Phone size={15}/>,     label:'WhatsApp',  value: form.customer_phone },
    form.customer_email && { icon:<Mail size={15}/>, label:'Email', value: form.customer_email },
    { icon:<Star size={15}/>,      label:'Purpose',   value: purposeObj?.label },
    { icon:<User size={15}/>,      label:'Party',     value: `${form.party_size} ${form.party_size === '1' ? 'person' : 'people'}` },
    form.notes && { icon:<MessageSquare size={15}/>, label:'Notes', value: form.notes },
  ].filter(Boolean);

  return (
    <div>
      <p style={{ fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase', color:'#b8860b', textAlign:'center', marginBottom:12 }}>Step 5</p>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(24px,4vw,36px)', fontWeight:300, color:'#1a1a1a', textAlign:'center', marginBottom:8 }}>
        Confirm your booking
      </h2>
      <p style={{ fontSize:13, color:'#888', textAlign:'center', marginBottom:32 }}>Please review your appointment details</p>

      <div style={{ maxWidth:480, margin:'0 auto' }}>
        {/* Summary card */}
        <div style={{ border:'1px solid #e5e0d8', marginBottom:24 }}>
          <div style={{ background:'#1a1a1a', padding:'16px 20px', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:24 }}>{purposeObj?.icon || '✨'}</span>
            <div>
              <p style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{purposeObj?.label || 'Appointment'}</p>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.5)' }}>Private boutique consultation</p>
            </div>
          </div>
          <div style={{ padding:'4px 0' }}>
            {rows.map((row, i) => (
              <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'10px 20px', borderBottom: i < rows.length - 1 ? '1px solid #f5f0e8' : 'none' }}>
                <span style={{ color:'#b8860b', flexShrink:0, marginTop:1 }}>{row.icon}</span>
                <div style={{ display:'flex', justifyContent:'space-between', flex:1, gap:12 }}>
                  <span style={{ fontSize:12, color:'#888', flexShrink:0 }}>{row.label}</span>
                  <span style={{ fontSize:12, fontWeight:500, color:'#1a1a1a', textAlign:'right' }}>{row.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize:12, color:'#888', textAlign:'center', marginBottom:24, lineHeight:1.6 }}>
          We'll send a confirmation to your WhatsApp within a few hours. Cancellations welcome up to 2 hours before.
        </p>

        <div style={{ display:'flex', gap:12 }}>
          <button onClick={onBack} disabled={submitting}
            style={{ background:'#fff', color:'#1a1a1a', border:'1px solid #e5e0d8', padding:'14px 24px', fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:8 }}>
            <ChevronLeft size={14}/> Edit
          </button>
          <button onClick={onSubmit} disabled={submitting}
            style={{ background: submitting ? '#888' : '#b8860b', color:'#fff', border:'none', padding:'14px 0', fontSize:12, fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', cursor: submitting ? 'not-allowed' : 'pointer', flex:1, display:'inline-flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background 0.2s' }}>
            {submitting ? 'Confirming…' : 'Confirm Appointment'}
            {!submitting && <Check size={15}/>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Success ───────────────────────────────────────────────────────────────────
function Success({ form, purpose, location }) {
  const purposeObj = PURPOSES.find(p => p.id === purpose);
  const fmtDate = form.preferred_date
    ? new Date(form.preferred_date + 'T12:00:00').toLocaleDateString('en-AE', { weekday:'long', day:'numeric', month:'long', year:'numeric' })
    : '';
  const waText = encodeURIComponent(`Hi TEJORI, I've just booked a ${purposeObj?.label} appointment at ${location} on ${fmtDate} at ${form.preferred_time}. My name is ${form.customer_name}. Looking forward to my visit!`);

  return (
    <div style={{ textAlign:'center', padding:'40px 20px', maxWidth:520, margin:'0 auto' }}>
      <div style={{ width:72, height:72, borderRadius:'50%', background:'#EAF3DE', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px' }}>
        <Check size={32} style={{ color:'#3B6D11' }}/>
      </div>
      <p style={{ fontSize:10, letterSpacing:'0.25em', textTransform:'uppercase', color:'#b8860b', marginBottom:12 }}>Booking confirmed</p>
      <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(28px,4vw,44px)', fontWeight:300, color:'#1a1a1a', marginBottom:12 }}>
        We'll see you soon
      </h2>
      <p style={{ fontSize:14, color:'#888', lineHeight:1.7, marginBottom:8 }}>
        Your appointment at <strong style={{ color:'#1a1a1a' }}>{location}</strong> is confirmed for
      </p>
      <p style={{ fontSize:16, fontWeight:600, color:'#1a1a1a', marginBottom:6 }}>{fmtDate}</p>
      <p style={{ fontSize:14, color:'#b8860b', fontWeight:500, marginBottom:32 }}>{form.preferred_time}</p>

      <p style={{ fontSize:13, color:'#888', marginBottom:24 }}>
        Our team will confirm via WhatsApp shortly. If you need to cancel or reschedule, please message us at least 2 hours before your appointment.
      </p>

      <div style={{ display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
        <a href={`https://wa.me/${WAPP}?text=${waText}`} target="_blank" rel="noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#25D366', color:'#fff', padding:'14px 32px', fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', width:'100%', maxWidth:320, justifyContent:'center' }}>
          💬 Message us on WhatsApp
        </a>
        <Link href="/jewellery"
          style={{ display:'inline-flex', alignItems:'center', gap:8, color:'#1a1a1a', padding:'14px 32px', fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none', border:'1px solid #e5e0d8', width:'100%', maxWidth:320, justifyContent:'center' }}>
          Browse our collection
        </Link>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AppointmentPage() {
  const [step, setStep]       = useState(0);
  const [done, setDone]       = useState(false);
  const [submitting, setSub]  = useState(false);
  const [error, setError]     = useState('');

  const [purpose,  setPurpose]  = useState('');
  const [location, setLocation] = useState('');
  const [form, setForm] = useState({
    preferred_date:'', preferred_time:'',
    customer_name:'', customer_phone:'', customer_email:'',
    party_size:'1', notes:'',
  });
  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    setSub(true); setError('');
    try {
      const res = await fetch(`${BASE}/appointments`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ ...form, purpose, location }),
      });
      const data = await res.json();
      if (data.success) { setDone(true); }
      else setError(data.message || 'Booking failed. Please try WhatsApp.');
    } catch { setError('Something went wrong. Please book via WhatsApp.'); }
    setSub(false);
  };

  if (done) return (
    <div style={{ paddingTop:80, fontFamily:"'Inter',system-ui,sans-serif", minHeight:'80vh', display:'flex', alignItems:'center' }}>
      <Success form={form} purpose={purpose} location={location}/>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Inter',system-ui,sans-serif", paddingTop:80, minHeight:'90vh' }}>
      {/* Header */}
      <div style={{ background:'#1a1a1a', padding:'48px 40px 40px', textAlign:'center' }}>
        <p style={{ fontSize:10, letterSpacing:'0.3em', textTransform:'uppercase', color:'#b8860b', marginBottom:12 }}>Private Consultation</p>
        <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(32px,5vw,56px)', fontWeight:300, color:'#fff', lineHeight:1.1 }}>
          Book an Appointment
        </h1>
      </div>

      {/* Steps content */}
      <div style={{ maxWidth:700, margin:'0 auto', padding:'48px 24px' }}>
        <Steps current={step}/>

        {error && (
          <div style={{ background:'#fef2f2', border:'1px solid #fecaca', padding:'12px 16px', marginBottom:24, fontSize:13, color:'#991b1b', textAlign:'center' }}>
            {error}{' '}
            <a href={`https://wa.me/${WAPP}`} target="_blank" rel="noreferrer" style={{ color:'#25D366', fontWeight:600 }}>Book via WhatsApp →</a>
          </div>
        )}

        {step === 0 && <StepPurpose value={purpose} onChange={setPurpose} onNext={() => setStep(1)}/>}
        {step === 1 && <StepLocation value={location} onChange={setLocation} onNext={() => setStep(2)} onBack={() => setStep(0)}/>}
        {step === 2 && (
          <StepDateTime
            date={form.preferred_date} time={form.preferred_time}
            onDateChange={v => setField('preferred_date', v)}
            onTimeChange={v => setField('preferred_time', v)}
            onNext={() => setStep(3)} onBack={() => setStep(1)}/>
        )}
        {step === 3 && <StepDetails form={form} onChange={setField} onNext={() => setStep(4)} onBack={() => setStep(2)}/>}
        {step === 4 && <StepConfirm form={form} purpose={purpose} location={location} onBack={() => setStep(3)} onSubmit={submit} submitting={submitting}/>}
      </div>
    </div>
  );
}
