'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock, Star, ArrowLeft, Check, AlertCircle } from 'lucide-react';

function Countdown({ targetDate }) {
  const [time, setTime] = useState({ d:0,h:0,m:0,s:0 });
  useEffect(()=>{
    const calc=()=>{
      const diff=new Date(targetDate)-new Date();
      if(diff<=0) return;
      setTime({d:Math.floor(diff/86400000),h:Math.floor((diff%86400000)/3600000),m:Math.floor((diff%3600000)/60000),s:Math.floor((diff%60000)/1000)});
    };
    calc(); const t=setInterval(calc,1000); return()=>clearInterval(t);
  },[targetDate]);
  if(new Date(targetDate)<=new Date()) return null;
  return (
    <div style={{ background:'#1a1a1a', padding:'28px 32px', textAlign:'center', marginBottom:32 }}>
      <p style={{ fontSize:9, letterSpacing:'0.25em', textTransform:'uppercase', color:'#888', marginBottom:16 }}>Exhibition starts in</p>
      <div style={{ display:'flex', justifyContent:'center', gap:32 }}>
        {[['d','Days'],['h','Hours'],['m','Minutes'],['s','Seconds']].map(([k,l])=>(
          <div key={k} style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:48, fontWeight:300, color:'#b8860b', lineHeight:1 }}>
              {String(time[k]).padStart(2,'0')}
            </div>
            <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:6 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ExhibitionDetailPage({ params }) {
  const [ex, setEx]                   = useState(null);
  const [loading, setLoading]         = useState(true);
  const [notFound, setNotFound]       = useState(false);
  const [form, setForm]               = useState({ full_name:'',email:'',phone:'',company:'',visit_date:'',visit_time:'',party_size:'1',notes:'' });
  const [submitting, setSubmitting]   = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [formError, setFormError]     = useState('');
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const base = process.env.NEXT_PUBLIC_API_URL || '/api';

  useEffect(()=>{
    fetch(`${base}/exhibitions/public/${params.slug}`)
      .then(r=>{ if(r.status===404) { setNotFound(true); return null; } return r.json(); })
      .then(r=>{ if(r) setEx(r.data); })
      .catch(()=>setNotFound(true))
      .finally(()=>setLoading(false));
  },[params.slug]);

  const handleRegister = async(e) => {
    e.preventDefault();
    setFormError('');
    if (!form.full_name.trim()) return setFormError('Please enter your full name.');
    if (!form.phone.trim())     return setFormError('Please enter your phone / WhatsApp number.');
    setSubmitting(true);
    try {
      const r = await fetch(`${base}/exhibitions/public/${params.slug}/register`,{
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form),
      });
      const data = await r.json();
      if(data.success) { setSubmitted(true); }
      else setFormError(data.message || 'Registration failed. Please try WhatsApp.');
    } catch { setFormError('Something went wrong. Please register via WhatsApp.'); }
    setSubmitting(false);
  };

  const inp = { width:'100%', padding:'11px 14px', border:'1px solid #e5e0d8', fontSize:13, outline:'none', background:'#fff', fontFamily:'inherit', boxSizing:'border-box' };
  const lbl = { display:'block', fontSize:10, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'#888', marginBottom:6 };

  if (loading) return (
    <div style={{ paddingTop:96, minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:32, height:32, border:'2px solid #b8860b', borderTopColor:'transparent', borderRadius:'50%', animation:'spin .8s linear infinite' }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound || !ex) return (
    <div style={{ paddingTop:96, minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16 }}>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#1a1a1a' }}>Exhibition not found</p>
      <Link href="/exhibitions" style={{ background:'#1a1a1a', color:'#fff', padding:'12px 24px', textDecoration:'none', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase' }}>
        View all exhibitions
      </Link>
    </div>
  );

  const now      = new Date();
  const start    = new Date(ex.start_date);
  const end      = new Date(ex.end_date);
  const isLive   = now >= start && now <= end;
  const upcoming = now < start;
  const isFull   = ex.max_registrations && +ex.reg_count >= +ex.max_registrations;
  const canReg   = ex.registration_open && !isFull;
  const galleries = Array.isArray(ex.gallery_images) ? ex.gallery_images.filter(Boolean) : [];
  const products  = Array.isArray(ex.featured_products) ? ex.featured_products.filter(Boolean) : [];

  return (
    <div style={{ fontFamily:"'Inter', system-ui, sans-serif", paddingTop:72 }}>

      {/* ── Hero ── */}
      <div style={{ position:'relative', height:'clamp(320px,45vh,520px)', overflow:'hidden', background:'#1a1a1a' }}>
        {ex.hero_image && (
          <img src={ex.hero_image} alt={ex.title}
            style={{ width:'100%', height:'100%', objectFit:'cover', opacity:0.6 }}/>
        )}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}/>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'48px', maxWidth:1100, margin:'0 auto' }}>
          <Link href="/exhibitions"
            style={{ display:'inline-flex', alignItems:'center', gap:6, color:'rgba(255,255,255,0.6)', fontSize:12, textDecoration:'none', marginBottom:16, transition:'color 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.color='#fff'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.6)'}>
            <ArrowLeft size={13}/> All exhibitions
          </Link>
          <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
            {isLive  && <span style={{ background:'#16a34a', color:'#fff', fontSize:10, fontWeight:700, padding:'4px 10px', letterSpacing:'0.08em' }}>● LIVE NOW</span>}
            {ex.is_vip && <span style={{ background:'#b8860b', color:'#fff', fontSize:10, fontWeight:700, padding:'4px 10px', letterSpacing:'0.08em' }}>✦ VIP EXCLUSIVE</span>}
          </div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(32px,5vw,60px)', fontWeight:300, color:'#fff', lineHeight:1.1, marginBottom:8 }}>
            {ex.title}
          </h1>
          {ex.subtitle && <p style={{ fontSize:15, color:'#d4a843', fontWeight:500 }}>{ex.subtitle}</p>}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'48px 32px', display:'grid', gridTemplateColumns:'1fr 360px', gap:48, alignItems:'start' }}>

        {/* ── Left: main content ── */}
        <div>
          {/* Key info bar */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:16, padding:'24px', background:'#faf8f3', border:'1px solid #e5e0d8', marginBottom:32 }}>
            {[
              { icon:<Calendar size={16} style={{color:'#b8860b'}}/>, label:'Dates',
                val:`${start.toLocaleDateString('en-AE',{day:'numeric',month:'short',year:'numeric'})}${ex.end_date!==ex.start_date?' — '+end.toLocaleDateString('en-AE',{day:'numeric',month:'short',year:'numeric'}):''}` },
              { icon:<Clock size={16} style={{color:'#b8860b'}}/>, label:'Hours', val:`${ex.start_time||'10:00'} — ${ex.end_time||'20:00'}` },
              ex.venue_name && { icon:<MapPin size={16} style={{color:'#b8860b'}}/>, label:'Venue', val:`${ex.venue_name}${ex.venue_city?`, ${ex.venue_city}`:''}` },
              ex.booth_number && { icon:<span style={{color:'#b8860b',fontWeight:700,fontSize:16}}>#</span>, label:'Booth', val:ex.booth_number },
            ].filter(Boolean).map((item,i)=>(
              <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                <div style={{ marginTop:1, flexShrink:0 }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize:9, color:'#888', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>{item.label}</p>
                  <p style={{ fontSize:13, fontWeight:500, color:'#1a1a1a' }}>{item.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Countdown */}
          {upcoming && <Countdown targetDate={ex.start_date}/>}

          {/* Description */}
          {ex.description && (
            <div style={{ marginBottom:40 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:16 }}>About this exhibition</h2>
              <p style={{ fontSize:14, color:'#555', lineHeight:1.9, whiteSpace:'pre-line' }}>{ex.description}</p>
            </div>
          )}

          {/* Gallery */}
          {galleries.length > 0 && (
            <div style={{ marginBottom:40 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:16 }}>Gallery</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                {galleries.map((img,i)=>(
                  <div key={i} style={{ aspectRatio:'1', overflow:'hidden' }}>
                    <img src={img} alt={`Gallery ${i+1}`}
                      style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s', cursor:'pointer' }}
                      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Featured products */}
          {products.length > 0 && (
            <div style={{ marginBottom:40 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:16 }}>Featured at this exhibition</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16 }}>
                {products.map(p=>(
                  <Link key={p.id} href={`/jewellery/${p.slug||p.id}`}
                    style={{ textDecoration:'none', border:'1px solid #e5e0d8', overflow:'hidden', display:'block' }}>
                    <div style={{ aspectRatio:'1', background:'#f5ede2', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, overflow:'hidden' }}>
                      {p.thumb_url
                        ? <img src={p.thumb_url} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                        : '💍'}
                    </div>
                    <div style={{ padding:'12px 14px' }}>
                      <p style={{ fontSize:12, fontWeight:600, color:'#1a1a1a', marginBottom:4, lineHeight:1.3 }}>{p.name}</p>
                      {p.is_featured && <span style={{ fontSize:9, fontWeight:600, color:'#b8860b', letterSpacing:'0.1em', textTransform:'uppercase' }}>✦ Featured</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {ex.venue_map_url && (
            <div style={{ marginBottom:40 }}>
              <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:28, fontWeight:300, color:'#1a1a1a', marginBottom:16 }}>Location</h2>
              <div style={{ border:'1px solid #e5e0d8', overflow:'hidden', height:280 }}>
                <iframe src={ex.venue_map_url} width="100%" height="100%" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
              </div>
              {ex.venue_address && (
                <p style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#888', marginTop:8 }}>
                  <MapPin size={12}/>{ex.venue_address}
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Right: Registration card ── */}
        <div style={{ position:'sticky', top:88 }}>
          <div style={{ border: ex.is_vip ? '1px solid #b8860b' : '1px solid #e5e0d8', padding:'28px' }}>
            {ex.is_vip && (
              <div style={{ background:'#b8860b', color:'#fff', textAlign:'center', padding:'8px', fontSize:10, fontWeight:700, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:20, marginTop:-28, marginLeft:-28, marginRight:-28 }}>
                ✦ VIP Registration
              </div>
            )}

            {submitted ? (
              <div style={{ textAlign:'center', padding:'24px 0' }}>
                <div style={{ width:56, height:56, background:'#dcfce7', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                  <Check size={24} style={{ color:'#16a34a' }}/>
                </div>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, color:'#1a1a1a', marginBottom:8 }}>
                  Registration confirmed!
                </h3>
                <p style={{ fontSize:13, color:'#888', lineHeight:1.6 }}>
                  We will confirm your attendance via WhatsApp. We look forward to seeing you.
                </p>
              </div>

            ) : isFull ? (
              <div style={{ textAlign:'center' }}>
                <p style={{ fontSize:15, fontWeight:600, color:'#1a1a1a', marginBottom:8 }}>Fully booked</p>
                <p style={{ fontSize:13, color:'#888', marginBottom:20 }}>Join the waitlist via WhatsApp</p>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||'971501234567'}?text=${encodeURIComponent(`Hi, I'd like to join the waitlist for ${ex.title}`)}`}
                  target="_blank" rel="noreferrer"
                  style={{ display:'block', background:'#25D366', color:'#fff', padding:'13px', textAlign:'center', fontSize:11, letterSpacing:'0.15em', textTransform:'uppercase', textDecoration:'none' }}>
                  💬 WhatsApp Waitlist
                </a>
              </div>

            ) : !canReg ? (
              <div style={{ textAlign:'center', padding:'16px 0' }}>
                <p style={{ fontSize:13, color:'#888' }}>Registration is currently closed.</p>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||'971501234567'}`}
                  target="_blank" rel="noreferrer"
                  style={{ display:'inline-block', marginTop:16, color:'#b8860b', fontSize:12, textDecoration:'none' }}>
                  Contact us on WhatsApp →
                </a>
              </div>

            ) : (
              <>
                <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:300, color:'#1a1a1a', marginBottom:4 }}>
                  {ex.is_vip ? 'Request VIP Access' : 'Register to attend'}
                </h3>
                {ex.reg_count > 0 && ex.max_registrations && (
                  <p style={{ fontSize:11, color:'#888', marginBottom:16 }}>
                    {ex.max_registrations - ex.reg_count} spots remaining
                  </p>
                )}
                {ex.reg_close_date && (
                  <p style={{ fontSize:11, color:'#b45309', marginBottom:16 }}>
                    Registration closes {new Date(ex.reg_close_date).toLocaleDateString('en-AE',{day:'numeric',month:'long'})}
                  </p>
                )}

                {formError && (
                  <div style={{ display:'flex', gap:8, alignItems:'flex-start', background:'#fef2f2', border:'1px solid #fecaca', padding:'10px 12px', marginBottom:16, fontSize:12, color:'#991b1b' }}>
                    <AlertCircle size={14} style={{ flexShrink:0, marginTop:1 }}/>
                    {formError}
                  </div>
                )}

                <form onSubmit={handleRegister} style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <div>
                    <label style={lbl}>Full name *</label>
                    <input value={form.full_name} onChange={e=>set('full_name',e.target.value)} required placeholder="Your full name" style={inp}/>
                  </div>
                  <div>
                    <label style={lbl}>Phone / WhatsApp *</label>
                    <input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)} required placeholder="+971 50 000 0000" style={inp}/>
                  </div>
                  <div>
                    <label style={lbl}>Email</label>
                    <input type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="your@email.com" style={inp}/>
                  </div>
                  <div>
                    <label style={lbl}>Company</label>
                    <input value={form.company} onChange={e=>set('company',e.target.value)} placeholder="Optional" style={inp}/>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div>
                      <label style={lbl}>Visit date</label>
                      <input type="date" value={form.visit_date} onChange={e=>set('visit_date',e.target.value)}
                        min={ex.start_date} max={ex.end_date} style={inp}/>
                    </div>
                    <div>
                      <label style={lbl}>Preferred time</label>
                      <select value={form.visit_time} onChange={e=>set('visit_time',e.target.value)} style={{...inp, cursor:'pointer'}}>
                        <option value="">Any time</option>
                        {['10:00','11:00','12:00','14:00','15:00','16:00','17:00','18:00','19:00'].map(t=>(
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Party size</label>
                    <select value={form.party_size} onChange={e=>set('party_size',e.target.value)} style={{...inp, cursor:'pointer'}}>
                      {['1','2','3','4','5+'].map(n=>(
                        <option key={n} value={n}>{n} {n==='1'?'person':'people'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Notes</label>
                    <textarea value={form.notes} onChange={e=>set('notes',e.target.value)} rows={2}
                      placeholder="Specific interests or requirements"
                      style={{...inp, resize:'vertical'}}/>
                  </div>
                  <button type="submit" disabled={submitting}
                    style={{ width:'100%', background: submitting ? '#aaa' : '#1a1a1a', color:'#fff', border:'none', padding:'14px', fontSize:11, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', cursor: submitting ? 'not-allowed' : 'pointer', marginTop:4 }}>
                    {submitting ? 'Registering…' : ex.is_vip ? '✦ Request VIP Access' : 'Confirm Registration'}
                  </button>
                  <p style={{ fontSize:10, color:'#aaa', textAlign:'center' }}>
                    We will confirm via WhatsApp within a few hours
                  </p>
                </form>
              </>
            )}
          </div>

          {/* WhatsApp alternative */}
          {!submitted && (
            <div style={{ marginTop:12, textAlign:'center' }}>
              <p style={{ fontSize:11, color:'#888', marginBottom:8 }}>Prefer to register via WhatsApp?</p>
              <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP||'971501234567'}?text=${encodeURIComponent(`Hi, I'd like to register for ${ex.title} (${new Date(ex.start_date).toLocaleDateString('en-AE',{day:'numeric',month:'long',year:'numeric'})})`)}`}
                target="_blank" rel="noreferrer"
                style={{ display:'inline-flex', alignItems:'center', gap:6, background:'#25D366', color:'#fff', padding:'10px 20px', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', textDecoration:'none' }}>
                💬 WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
