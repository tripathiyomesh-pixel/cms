import { useState, useEffect } from "react";
import { jewelleryAPI } from "../services/api";
import toast from "react-hot-toast";

const PURPOSES = [
  { id: 'product_discovery', label: 'Product discovery', icon: '💎', desc: 'Explore our jewellery collections' },
  { id: 'engagement',        label: 'Engagement ring',   icon: '💍', desc: 'Find the perfect engagement ring' },
  { id: 'bridal',            label: 'Bridal jewellery',  icon: '👰', desc: 'Complete bridal sets & accessories' },
  { id: 'gifting',           label: 'Gift selection',    icon: '🎁', desc: 'Select a special gift' },
  { id: 'resize_repair',     label: 'Resize or repair',  icon: '🔧', desc: 'Resize, repair, or polish' },
  { id: 'valuation',         label: 'Jewellery valuation', icon: '📋', desc: 'Professional appraisal & valuation' },
];

const STEPS = ['purpose', 'location', 'datetime', 'details', 'confirm'];

export default function AppointmentBookingModal({
  isOpen, onClose,
  productRef = null, productName = null, productUrl = null,
  licenseId, storeLocations = [], storeName = 'Our Boutique'
}) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState([]);
  const [booking, setBooking] = useState(null); // confirmed booking
  const [form, setForm] = useState({
    purpose: '', location_id: '', date: '', time: '',
    customer_name: '', customer_phone: '', customer_email: '',
    party_size: '1', special_requests: ''
  });

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setBooking(null);
      setForm({ purpose: productRef ? 'product_discovery' : '', location_id: storeLocations.length === 1 ? String(storeLocations[0].id) : '', date: '', time: '', customer_name: '', customer_phone: '', customer_email: '', party_size: '1', special_requests: '' });
    }
  }, [isOpen]);

  // Load slots when date + location selected
  useEffect(() => {
    if (form.date && licenseId) {
      setSlots([]);
      jewelleryAPI.getSlots({ license_id: licenseId, location_id: form.location_id || undefined, date: form.date })
        .then(r => setSlots(r.data?.data?.slots || []))
        .catch(() => {});
    }
  }, [form.date, form.location_id]);

  // Min date = tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  // Max date = 60 days out
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const canNext = () => {
    if (step === 0) return !!form.purpose;
    if (step === 1) return storeLocations.length === 0 || !!form.location_id;
    if (step === 2) return !!form.date && !!form.time;
    if (step === 3) return !!form.customer_name && !!form.customer_phone;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const selectedPurpose = PURPOSES.find(p => p.id === form.purpose);
      const r = await jewelleryAPI.bookAppointment({
        license_id: licenseId,
        location_id: form.location_id || undefined,
        customer_name: form.customer_name,
        customer_phone: form.customer_phone,
        customer_email: form.customer_email,
        preferred_date: form.date,
        preferred_time: form.time,
        purpose: selectedPurpose?.label || form.purpose,
        product_ref: productRef,
        product_name: productName,
        product_url: productUrl,
        party_size: parseInt(form.party_size),
        special_requests: form.special_requests
      });
      setBooking(r.data?.data);
      setStep(5); // confirmation step
    } catch(e) {
      toast.error('Could not book. Please try again.');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const gold = '#c9a84c';
  const overlay = { position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'16px' };
  const panel = { background:'#fff', borderRadius:20, width:'100%', maxWidth:540, maxHeight:'90vh', overflowY:'auto', fontFamily:'Inter,sans-serif', position:'relative' };
  const header = { padding:'28px 28px 0', borderBottom:'1px solid #f0f0f0', paddingBottom:20 };
  const body = { padding:'24px 28px' };
  const footer = { padding:'16px 28px 28px', display:'flex', gap:10, justifyContent:'space-between' };
  const btnPrimary = { background:gold, color:'#000', border:'none', borderRadius:10, padding:'12px 28px', fontWeight:700, cursor:'pointer', fontSize:14, flex:1 };
  const btnSecondary = { background:'transparent', color:'#666', border:'1px solid #e0e0e0', borderRadius:10, padding:'12px 20px', fontWeight:500, cursor:'pointer', fontSize:14 };
  const inputStyle = { width:'100%', border:'1px solid #e0e0e0', borderRadius:10, padding:'12px 14px', fontSize:14, color:'#1a1a1a', outline:'none', boxSizing:'border-box' };
  const label = { fontSize:12, fontWeight:600, color:'#888', display:'block', marginBottom:6, textTransform:'uppercase', letterSpacing:'0.05em' };

  const stepLabels = ['Purpose', 'Location', 'Date & Time', 'Your details', 'Confirm'];

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={panel}>

        {/* Header */}
        <div style={header}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
            <div>
              <h2 style={{ fontSize:20, fontWeight:700, margin:0, color:'#1a1a1a' }}>Book an appointment</h2>
              <p style={{ fontSize:13, color:'#888', margin:'4px 0 0' }}>{storeName}</p>
            </div>
            <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#999', lineHeight:1, padding:0, marginTop:-4 }}>×</button>
          </div>

          {/* Product context strip */}
          {productName && step < 5 && (
            <div style={{ marginTop:14, padding:'10px 14px', background:'#faf8f3', borderRadius:10, border:`1px solid ${gold}33`, display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontSize:18 }}>💎</span>
              <div>
                <p style={{ fontSize:12, color:'#888', margin:0 }}>Enquiring about</p>
                <p style={{ fontSize:13, fontWeight:600, color:'#1a1a1a', margin:0 }}>{productName}</p>
              </div>
            </div>
          )}

          {/* Step progress */}
          {step < 5 && (
            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:20 }}>
              {stepLabels.map((label, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, flex:i < stepLabels.length - 1 ? 1 : 'none' }}>
                  <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700,
                    background: i < step ? gold : i === step ? '#1a1a1a' : '#f0f0f0',
                    color: i <= step ? (i < step ? '#000' : '#fff') : '#999', flexShrink:0 }}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  {i < stepLabels.length - 1 && <div style={{ flex:1, height:2, background: i < step ? gold : '#f0f0f0', borderRadius:2 }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={body}>

          {/* ── STEP 0: PURPOSE ── */}
          {step === 0 && (
            <div>
              <p style={{ fontSize:14, color:'#555', marginBottom:18 }}>How can we help you today?</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {PURPOSES.map(p => (
                  <button key={p.id} onClick={() => set('purpose', p.id)}
                    style={{ background: form.purpose === p.id ? '#faf8f3' : '#fafafa', border:`2px solid ${form.purpose===p.id?gold:'#eee'}`, borderRadius:12, padding:'16px 14px', cursor:'pointer', textAlign:'left', transition:'all .15s' }}>
                    <div style={{ fontSize:24, marginBottom:6 }}>{p.icon}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1a1a1a', marginBottom:2 }}>{p.label}</div>
                    <div style={{ fontSize:11, color:'#999' }}>{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 1: LOCATION ── */}
          {step === 1 && (
            <div>
              <p style={{ fontSize:14, color:'#555', marginBottom:18 }}>Choose your preferred boutique</p>
              {storeLocations.length === 0 ? (
                <div style={{ padding:'20px', background:'#faf8f3', borderRadius:12, textAlign:'center' }}>
                  <p style={{ fontSize:14, color:'#888', margin:0 }}>We will confirm the location after booking</p>
                </div>
              ) : storeLocations.map(loc => (
                <button key={loc.id} onClick={() => set('location_id', String(loc.id))}
                  style={{ width:'100%', background: form.location_id===String(loc.id)?'#faf8f3':'#fafafa', border:`2px solid ${form.location_id===String(loc.id)?gold:'#eee'}`, borderRadius:12, padding:'16px', cursor:'pointer', textAlign:'left', marginBottom:10, transition:'all .15s' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:'#1a1a1a', margin:'0 0 4px' }}>{loc.name}</p>
                      <p style={{ fontSize:12, color:'#888', margin:'0 0 4px' }}>{loc.address}{loc.city ? `, ${loc.city}` : ''}</p>
                      {loc.working_hours && <p style={{ fontSize:11, color:'#aaa', margin:0 }}>🕐 {loc.working_hours}</p>}
                    </div>
                    {form.location_id===String(loc.id) && <div style={{ width:20, height:20, borderRadius:'50%', background:gold, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, flexShrink:0 }}>✓</div>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* ── STEP 2: DATE & TIME ── */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom:20 }}>
                <label style={label}>Select date</label>
                <input type="date" value={form.date} min={minDateStr} max={maxDateStr}
                  onChange={e => { set('date', e.target.value); set('time', ''); }}
                  style={inputStyle} />
              </div>
              {form.date && (
                <div>
                  <label style={label}>Available time slots</label>
                  {slots.length === 0 ? (
                    <p style={{ fontSize:13, color:'#aaa' }}>Loading slots…</p>
                  ) : (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                      {slots.map(slot => (
                        <button key={slot.time} disabled={!slot.available} onClick={() => set('time', slot.time)}
                          style={{ padding:'10px 6px', borderRadius:10, cursor:slot.available?'pointer':'not-allowed', fontSize:12, fontWeight:form.time===slot.time?700:400, textAlign:'center',
                            background: !slot.available?'#f5f5f5':form.time===slot.time?gold:'#fafafa',
                            border:`2px solid ${!slot.available?'#f0f0f0':form.time===slot.time?gold:'#eee'}`,
                            color: !slot.available?'#ccc':form.time===slot.time?'#000':'#333',
                            transition:'all .15s' }}>
                          {slot.time}
                          {!slot.available && <div style={{ fontSize:10, color:'#ccc' }}>Full</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {form.date && form.time && (
                <div style={{ marginTop:16, padding:'12px 16px', background:'#faf8f3', borderRadius:10, border:`1px solid ${gold}33` }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'#1a1a1a', margin:0 }}>
                    📅 {new Date(form.date).toLocaleDateString('en-AE', {weekday:'long',day:'numeric',month:'long',year:'numeric'})} at {form.time}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 3: CUSTOMER DETAILS ── */}
          {step === 3 && (
            <div style={{ display:'grid', gap:16 }}>
              <div>
                <label style={label}>Full name *</label>
                <input type="text" value={form.customer_name} onChange={e => set('customer_name',e.target.value)} style={inputStyle} placeholder="Your full name" />
              </div>
              <div>
                <label style={label}>WhatsApp / Phone number *</label>
                <input type="tel" value={form.customer_phone} onChange={e => set('customer_phone',e.target.value)} style={inputStyle} placeholder="+971 50 000 0000" />
              </div>
              <div>
                <label style={label}>Email address (optional)</label>
                <input type="email" value={form.customer_email} onChange={e => set('customer_email',e.target.value)} style={inputStyle} placeholder="your@email.com" />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:12 }}>
                <div>
                  <label style={label}>Party size</label>
                  <select value={form.party_size} onChange={e => set('party_size',e.target.value)} style={inputStyle}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {n===1?'person':'people'}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Special requests (optional)</label>
                  <input type="text" value={form.special_requests} onChange={e => set('special_requests',e.target.value)} style={inputStyle} placeholder="e.g. Anniversary, need privacy" />
                </div>
              </div>
              <p style={{ fontSize:11, color:'#bbb', margin:0 }}>We will confirm your appointment via WhatsApp within 2 hours.</p>
            </div>
          )}

          {/* ── STEP 4: CONFIRM SUMMARY ── */}
          {step === 4 && (
            <div>
              <p style={{ fontSize:14, color:'#555', marginBottom:18 }}>Please review your appointment details</p>
              {[
                ['Purpose',  PURPOSES.find(p=>p.id===form.purpose)?.label || form.purpose],
                ['Date',     new Date(form.date).toLocaleDateString('en-AE',{weekday:'long',day:'numeric',month:'long',year:'numeric'})],
                ['Time',     form.time],
                ['Location', storeLocations.find(l=>String(l.id)===form.location_id)?.name || 'To be confirmed'],
                ['Name',     form.customer_name],
                ['Phone',    form.customer_phone],
                form.customer_email ? ['Email', form.customer_email] : null,
                parseInt(form.party_size) > 1 ? ['Party', `${form.party_size} people`] : null,
                form.special_requests ? ['Requests', form.special_requests] : null,
              ].filter(Boolean).map(([k,v]) => (
                <div key={k} style={{ display:'flex', padding:'10px 0', borderBottom:'1px solid #f5f5f5' }}>
                  <span style={{ fontSize:13, color:'#999', width:110, flexShrink:0 }}>{k}</span>
                  <span style={{ fontSize:13, fontWeight:500, color:'#1a1a1a' }}>{v}</span>
                </div>
              ))}
              {productName && (
                <div style={{ marginTop:14, padding:'12px 14px', background:'#faf8f3', borderRadius:10, border:`1px solid ${gold}33` }}>
                  <p style={{ fontSize:12, color:'#888', margin:'0 0 2px' }}>Regarding</p>
                  <p style={{ fontSize:13, fontWeight:600, color:'#1a1a1a', margin:0 }}>{productName}</p>
                </div>
              )}
            </div>
          )}

          {/* ── STEP 5: CONFIRMATION ── */}
          {step === 5 && booking && (
            <div style={{ textAlign:'center', padding:'10px 0' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'#f0fdf4', border:'3px solid #22c55e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, margin:'0 auto 20px' }}>✓</div>
              <h3 style={{ fontSize:20, fontWeight:700, margin:'0 0 6px', color:'#1a1a1a' }}>Appointment confirmed!</h3>
              <p style={{ fontSize:14, color:'#888', margin:'0 0 24px' }}>We will contact you on WhatsApp to confirm.</p>

              <div style={{ background:'#faf8f3', borderRadius:14, padding:'20px', border:`1px solid ${gold}33`, textAlign:'left', marginBottom:20 }}>
                <div style={{ textAlign:'center', marginBottom:14 }}>
                  <p style={{ fontSize:11, color:'#999', margin:'0 0 4px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Booking reference</p>
                  <p style={{ fontSize:22, fontWeight:800, color:gold, margin:0, letterSpacing:'0.05em', fontFamily:'monospace' }}>{booking.booking_ref}</p>
                </div>
                <div style={{ borderTop:'1px solid #f0e8d0', paddingTop:14 }}>
                  {[
                    ['📅 Date', new Date(booking.preferred_date).toLocaleDateString('en-AE',{weekday:'long',day:'numeric',month:'long'})],
                    ['🕐 Time', booking.preferred_time],
                    booking.location?.name ? ['📍 Boutique', booking.location.name] : null,
                    booking.location?.address ? ['Address', booking.location.address] : null,
                  ].filter(Boolean).map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0' }}>
                      <span style={{ fontSize:13, color:'#999' }}>{k}</span>
                      <span style={{ fontSize:13, fontWeight:500, color:'#1a1a1a', textAlign:'right', maxWidth:200 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* WhatsApp confirmation link */}
              {booking.location?.whatsapp || form.customer_phone ? (
                <a href={`https://wa.me/${(booking.location?.whatsapp || '').replace(/\D/g,'')}?text=${encodeURIComponent(`Hi! I just booked an appointment.\n\nRef: ${booking.booking_ref}\nDate: ${booking.preferred_date} at ${booking.preferred_time}\nName: ${form.customer_name}`)}`}
                  target="_blank" rel="noreferrer"
                  style={{ display:'block', background:'#22c55e', color:'#fff', borderRadius:10, padding:'13px', textAlign:'center', textDecoration:'none', fontSize:14, fontWeight:700, marginBottom:10 }}>
                  💬 Confirm on WhatsApp
                </a>
              ) : null}
              <button onClick={onClose} style={{ ...btnSecondary, width:'100%' }}>Done</button>
            </div>
          )}
        </div>

        {/* Footer navigation */}
        {step < 5 && (
          <div style={footer}>
            {step > 0
              ? <button onClick={() => setStep(s => s-1)} style={btnSecondary}>Back</button>
              : <div />
            }
            {step < 4
              ? <button onClick={() => setStep(s => s+1)} disabled={!canNext()}
                  style={{ ...btnPrimary, opacity: canNext()?1:0.4, cursor:canNext()?'pointer':'not-allowed' }}>
                  Continue
                </button>
              : <button onClick={handleSubmit} disabled={loading || !canNext()}
                  style={{ ...btnPrimary, opacity:loading?0.7:1 }}>
                  {loading ? 'Booking…' : 'Confirm appointment'}
                </button>
            }
          </div>
        )}
      </div>
    </div>
  );
}
